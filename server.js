const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const cheerio = require('cheerio');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

let zipTaxMap = {};
try {
    const csvData = fs.readFileSync(path.join(__dirname, 'data', 'tax_rates.csv'), 'utf8');
    const lines = csvData.split('\n');
    for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',');
        if (parts.length >= 5) {
            const zip = parts[2].trim();
            const rate = parseFloat(parts[4].trim());
            if (zip && !isNaN(rate)) {
                zipTaxMap[zip] = rate;
            }
        }
    }
    console.log(`Loaded ${Object.keys(zipTaxMap).length} zip tax rates.`);
} catch (err) {
    console.error('Could not load tax_rates.csv. Tax API will be unavailable.', err);
}

// Serve the static frontend files
app.use(express.static(path.join(__dirname, '/')));

app.post('/api/wishlist/import', async (req, res) => {
    try {
        const { url } = req.body;
        
        if (!url) {
            return res.status(400).json({ error: 'Please provide a valid product URL.' });
        }

        if (!process.env.SCRAPER_API_KEY) {
            return res.status(500).json({ error: 'ScraperAPI key is missing in backend.' });
        }

        const isAmazon = url.toLowerCase().includes('amazon.');

        if (isAmazon) {
            // Extract ASIN (10 character alphanumeric string)
            const asinMatch = url.match(/(?:dp|gp\/product|product)\/([A-Z0-9]{10})/i);
            const asin = asinMatch ? asinMatch[1] : null;

            if (!asin) {
                return res.status(400).json({ error: 'Could not extract ASIN from Amazon URL.' });
            }

            const scraperUrl = `https://api.scraperapi.com/structured/amazon/product?api_key=${process.env.SCRAPER_API_KEY}&asin=${asin}&country=us`;
            const response = await fetch(scraperUrl);
            
            if (!response.ok) {
                return res.status(500).json({ error: 'Failed to fetch from ScraperAPI.' });
            }

            const product = await response.json();
            let title = product.name || 'Unknown Product';
            title = title.split(/[,|]|\s-\s/)[0].trim();
            if (title.length > 60) title = title.substring(0, 57) + '...';

            const priceStr = product.pricing || product.price || '0';
            const price = parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0;
            const img = (product.images && product.images.length > 0) ? product.images[0] : '';

            return res.json({
                asin: asin,
                title: title,
                price: price,
                img: img,
                source: 'Amazon'
            });
        } else {
            // Generic ScraperAPI
            let domain = 'Other';
            try {
                const targetUrl = new URL(url);
                const hostnameParts = targetUrl.hostname.replace('www.', '').split('.');
                if (hostnameParts.length > 0) {
                    domain = hostnameParts[0].charAt(0).toUpperCase() + hostnameParts[0].slice(1);
                }
            } catch (e) {}

            // Use premium=true for sites with strict bot protection like Best Buy
            // Use render=true to execute JS because stores often hide prices behind React/Angular
            const scraperUrl = `https://api.scraperapi.com?api_key=${process.env.SCRAPER_API_KEY}&url=${encodeURIComponent(url)}&premium=true&render=true`;
            const response = await fetch(scraperUrl);

            if (!response.ok) {
                const text = await response.text();
                console.error("ScraperAPI Error:", response.status, text);
                return res.status(500).json({ error: 'Failed to fetch the webpage.' });
            }

            const html = await response.text();
            const $ = cheerio.load(html);

            let title = $('meta[property="og:title"]').attr('content') || 
                        $('meta[name="twitter:title"]').attr('content') || 
                        $('title').text() || 'Unknown Product';
            
            title = title.trim();
            if (title.length > 60) title = title.substring(0, 57) + '...';

            let img = $('meta[property="og:image"]').attr('content') || 
                      $('meta[name="twitter:image"]').attr('content') || 
                      $('img').first().attr('src') || '';

            let priceStr = '0';

            // 1. Try JSON-LD structured data first (Best Buy, Ikea, Nike use this heavily)
            $('script[type="application/ld+json"]').each((i, el) => {
                try {
                    const jsonData = JSON.parse($(el).html());
                    const items = Array.isArray(jsonData) ? jsonData : [jsonData];
                    for (let item of items) {
                        const products = item['@graph'] ? item['@graph'].filter(x => x['@type'] === 'Product') : [item];
                        for (let prod of products) {
                            if (prod['@type'] === 'Product' && prod.offers) {
                                const offer = Array.isArray(prod.offers) ? prod.offers[0] : prod.offers;
                                if (offer.price) {
                                    priceStr = offer.price.toString();
                                    return false; // break loop
                                }
                            }
                        }
                    }
                } catch(e) {}
            });

            // 2. Try Open Graph meta tags
            if (priceStr === '0') {
                priceStr = $('meta[property="product:price:amount"]').attr('content') || 
                           $('meta[property="og:price:amount"]').attr('content') || '0';
            }

            // 2.5 Hardcoded selectors for Best Buy, Ikea, Nike
            if (priceStr === '0') {
                const specificPriceElement = $([
                    '[itemprop="price"]',                  // Universal Microdata
                    '.priceView-hero-price span',          // Best Buy
                    '.priceView-customer-price span',      // Best Buy
                    '.sr-only:contains("Price:") + span',  // Best Buy mobile/alt
                    '.pip-temp-price__integer',            // Ikea
                    '.pip-price-module__primary-currency-price', // Ikea
                    '[data-test="product-price"]',         // Nike
                    '.product-price',                      // Nike
                    '.price-display',                      // Generic
                    '.current-price'                       // Generic
                ].join(', ')).first();

                let foundPrice = specificPriceElement.attr('content') || specificPriceElement.text();
                
                const specificMatch = foundPrice.match(/\$?\s*(\d+(?:\.\d{2})?)/);
                if (specificMatch) {
                    priceStr = specificMatch[1];
                }
            }
            
            // 3. Fallback regex search on specific price containers only (not the whole body)
            if (priceStr === '0') {
                const priceContainers = $('[class*="product-price" i], [id*="product-price" i], [class*="price-current" i]').text();
                const containerMatch = priceContainers.match(/\$\s*(\d+(?:\.\d{2})?)/);
                if (containerMatch) {
                    priceStr = containerMatch[1];
                }
            }

            const price = parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0;

            return res.json({
                title: title,
                price: price,
                img: img,
                source: domain
            });
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to process URL.' });
    }
});

app.get('/api/tax/:zip', (req, res) => {
    const zip = req.params.zip;
    if (zipTaxMap[zip] !== undefined) {
        res.json({ zip: zip, rate: zipTaxMap[zip] });
    } else {
        res.status(404).json({ error: 'Zip code not found or rate not available.' });
    }
});

const PORT = process.env.PORT || 8001;
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server is running at http://localhost:${PORT}`);
    });
}

module.exports = app;
