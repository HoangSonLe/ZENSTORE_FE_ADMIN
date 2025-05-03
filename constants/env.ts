// Define window runtime config type
declare global {
    interface Window {
        ENV_CONFIG?: {
            API_URL?: string;
            SITE_NAME?: string;
            AUTH_ENABLED?: boolean;
            SESSION_TIMEOUT?: number;
        };
    }
}

// Get values from runtime config if available (client-side only)
const getRuntimeValue = <T>(key: string, defaultValue: T): T => {
    if (typeof window !== "undefined" && window.ENV_CONFIG && key in window.ENV_CONFIG) {
        return window.ENV_CONFIG[key as keyof typeof window.ENV_CONFIG] as unknown as T;
    }
    return defaultValue;
};

// Build-time environment values
const buildEnv = {
    API_URL: process.env.NEXT_PUBLIC_API_URL || "https://10.0.0.11:44368",
    SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME || "ZenStore",
    AUTH_ENABLED: process.env.NEXT_PUBLIC_AUTH_ENABLED !== "false", // Enabled by default
    SESSION_TIMEOUT: parseInt(process.env.NEXT_PUBLIC_SESSION_TIMEOUT || "60", 10) * 60 * 1000,
};

// Combined environment with runtime values taking precedence
const env = {
    // API URL with runtime override
    get API_URL() {
        return getRuntimeValue<string>("API_URL", buildEnv.API_URL);
    },

    // Site name with runtime override
    get SITE_NAME() {
        return getRuntimeValue<string>("SITE_NAME", buildEnv.SITE_NAME);
    },

    // Authentication settings with runtime override
    get AUTH_ENABLED() {
        return getRuntimeValue<boolean>("AUTH_ENABLED", buildEnv.AUTH_ENABLED);
    },

    // Session timeout with runtime override
    get SESSION_TIMEOUT() {
        return getRuntimeValue<number>("SESSION_TIMEOUT", buildEnv.SESSION_TIMEOUT);
    },
};

export default env;
