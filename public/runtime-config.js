// Minimal runtime configuration with authentication disabled
window.RUNTIME_CONFIG = {
    // Base URL for the application (without trailing slash)
    BASE_URL: "",

    // API URL for backend services (from environment variable)
    API_URL: "https://10.0.0.11:44368",

    // Basic settings
    DEBUG: false,
    VERSION: "1.0.0",

    // Path handling for static export
    USE_RELATIVE_PATHS: true,
    PROBLEMATIC_CHUNKS: [],
    USE_BLOB_FOR_SPECIAL_CHUNKS: false,

    // Authentication disabled
    AUTH_ENABLED: false,

    // Session timeout in milliseconds (60 minutes)
    SESSION_TIMEOUT: 60 * 60 * 1000,
};
