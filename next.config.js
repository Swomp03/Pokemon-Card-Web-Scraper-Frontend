/** @type {import('next').NextConfig} */
const nextConfig = {
    // output: 'export',
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    images: {
        unoptimized: true,
    },
    // basePath: '/Pokemon-Card-Web-Scraper-Frontend',
    // assetPrefix: '/Pokemon-Card-Web-Scraper-Frontend',
};

module.exports = nextConfig;