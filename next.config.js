/** @type {import('next').NextConfig} */

const nextConfig = {
    // Add performance optimizations
    reactStrictMode: true,
    swcMinify: true,
    // Disable type checking during development
    typescript: {
        ignoreBuildErrors: true,
    },
    // Optimize compilation
    // Note: removeConsole is disabled for Turbopack compatibility
    ...(process.env.NODE_ENV === "production"
        ? {
              compiler: {
                  removeConsole: true,
              },
          }
        : {}),
    // Reduce build output
    output: "standalone",
    poweredByHeader: false,
    // Keep existing configs
    webpack(config) {
        // Grab the existing rule that handles SVG imports
        const fileLoaderRule = config.module.rules.find((rule) => rule.test?.test?.(".svg"));

        config.module.rules.push(
            // Reapply the existing rule, but only for svg imports ending in ?url
            {
                ...fileLoaderRule,
                test: /\.svg$/i,
                resourceQuery: /url/, // *.svg?url
            },
            // Convert all other *.svg imports to React components
            {
                test: /\.svg$/i,
                issuer: fileLoaderRule.issuer,
                resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] }, // exclude if *.svg?url
                use: ["@svgr/webpack"],
            }
        );

        // Modify the file loader rule to ignore *.svg, since we have it handled now.
        fileLoaderRule.exclude = /\.svg$/i;

        // Add optimization
        config.optimization = {
            ...config.optimization,
            runtimeChunk: "single",
            splitChunks: {
                chunks: "all",
                maxInitialRequests: 25,
                minSize: 20000,
            },
        };

        return config;
    },
    // Keep your existing images config
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "api.lorem.space",
            },
            {
                protocol: "https",
                hostname: "lh3.googleusercontent.com",
            },
            {
                protocol: "https",
                hostname: "a0.muscache.com",
            },
            {
                protocol: "https",
                hostname: "avatars.githubusercontent.com",
            },
        ],
    },
};

module.exports = nextConfig;
