/** @type {import('next').NextConfig} */

// Determine the asset prefix based on the environment
// This will be overridden at runtime by runtime-config.js
const isProd = process.env.NODE_ENV === "production";
const assetPrefix = isProd
    ? process.env.NEXT_PUBLIC_BASE_URL || "https://client.zenstores.com.vn"
    : "";

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
    ...(isProd
        ? {
              compiler: {
                  removeConsole: true,
              },
          }
        : {}),
    // Enable static exports
    output: "export",
    // Set the asset prefix for production
    assetPrefix: assetPrefix,
    // Set the base path if your app is not hosted at the root
    // basePath: '',
    poweredByHeader: false,
    // Fix TinyMCE issues
    transpilePackages: ["@tinymce/tinymce-react", "tinymce"],
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
    // Updated images config with unoptimized option
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
            {
                protocol: "https",
                hostname: "10.0.0.11",
            },
        ],
        // For static exports, images must be unoptimized
        unoptimized: true,
    },
    // Disable server-only features for static export
    trailingSlash: true,
    // Skip type checking during build for faster builds
    eslint: {
        ignoreDuringBuilds: true,
    },
    // Exclude specific pages from the build
    experimental: {
        // Add any valid experimental options here if needed
    },

    // Note: rewrites don't work with static exports (output: "export")
    // We'll use client-side redirects instead
};

module.exports = nextConfig;
