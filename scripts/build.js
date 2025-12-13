
const fs = require('fs');
const path = require('path');

// Configuration
const DATABASE_PATH = path.join(__dirname, '../data/database.json');
const PUBLIC_ARTICLES_PATH = path.join(__dirname, '../data/articles.json');
const SITEMAP_PATH = path.join(__dirname, '../sitemap.xml');
const BASE_URL = 'https://www.baowanreview.com';

async function build() {
    console.log('🚀 Starting Daily Build...');

    // 1. Read Database
    if (!fs.existsSync(DATABASE_PATH)) {
        console.error('❌ Database file not found!');
        process.exit(1);
    }
    const allArticles = JSON.parse(fs.readFileSync(DATABASE_PATH, 'utf8'));
    console.log(`📦 Loaded ${allArticles.length} articles from database.`);

    // 2. Filter Published Articles
    const now = new Date();
    const publishedArticles = allArticles.filter(article => {
        if (!article.publishDate) return true; // Immediate publish
        const pubDate = new Date(article.publishDate);
        return pubDate <= now;
    });

    console.log(`✅ ${publishedArticles.length} articles are live as of ${now.toISOString()}`);

    // 3. Update Public JSON
    // Only write necessary fields to keep public file small and fast
    const publicData = publishedArticles.map(a => ({
        id: a.id,
        title: a.title,
        intro: a.intro,
        link: a.webPath,
        image: a.imageRootPath,
        category: a.category,
        publishDate: a.publishDate
    }));

    fs.writeFileSync(PUBLIC_ARTICLES_PATH, JSON.stringify(publicData, null, 2));
    console.log('💾 Updated data/articles.json');

    // 4. Update Sitemap (Optional but good for SEO)
    let sitemapContent = fs.readFileSync(SITEMAP_PATH, 'utf8');
    
    // Simple sitemap touch (updating lastmod for main pages)
    const today = new Date().toISOString().split('T')[0];
    // Regex replacement to update main page lastmod
    sitemapContent = sitemapContent.replace(
        /(<loc>.*?\/insights.html<\/loc>\s*<lastmod>).*?(<\/lastmod>)/, 
        `$1${today}$2`
    );
    
    fs.writeFileSync(SITEMAP_PATH, sitemapContent);
    console.log('🗺️ Updated Sitemap lastmod');

    console.log('🎉 Build Complete!');
}

build();
