// This file can be modified after the build to change configuration values
window.RUNTIME_CONFIG = {
    // Base URL for the application (without trailing slash)
    // Set to empty string to use relative paths (helps avoid 403 errors)
    BASE_URL: "https://client.zenstores.com.vn",

    // API URL for backend services
    API_URL: "https://10.0.0.11:44368",

    // Other runtime configuration options can be added here
    DEBUG: true,
    VERSION: "1.0.0",

    // Use relative paths for chunks to avoid 403 errors
    USE_RELATIVE_PATHS: true,

    // List of problematic chunks that need special handling
    // Empty array since project doesn't have problematic chunks anymore
    PROBLEMATIC_CHUNKS: [],

    // Use blob URLs for chunks with special characters
    // Disabled since there are no problematic chunks
    USE_BLOB_FOR_SPECIAL_CHUNKS: false,
};
