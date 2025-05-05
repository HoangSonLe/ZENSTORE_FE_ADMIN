"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { apiService } from "@/apis/axios";
import toast from "react-hot-toast";
import authApi from "@/apis/auth/auth.api";
import env from "@/constants/env";
import { useApi } from "@/hooks/useApi";

// Add environment config type definition
declare global {
    interface Window {
        ENV_CONFIG: {
            API_URL: string;
            SITE_NAME: string;
            AUTH_ENABLED: boolean;
            SESSION_TIMEOUT: number;
            BASE_URL: string;
            USE_RELATIVE_PATHS: boolean;
            PROBLEMATIC_CHUNKS: string[];
            USE_BLOB_FOR_SPECIAL_CHUNKS: boolean;
            DEBUG: boolean;
            VERSION: string;
        };
        // Keep RUNTIME_CONFIG for backward compatibility
        RUNTIME_CONFIG: {
            BASE_URL: string;
            API_URL: string;
            DEBUG: boolean;
            VERSION: string;
            USE_RELATIVE_PATHS: boolean;
            USE_BLOB_FOR_SPECIAL_CHUNKS: boolean;
            PROBLEMATIC_CHUNKS: string[];
            SESSION_TIMEOUT?: number;
            AUTH_ENABLED?: boolean;
        };
    }
}

// Define types
type User = {
    id: number;
    name: string;
    email: string;
    image?: string;
};

type AuthContextType = {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    authByCode: (code: string) => Promise<boolean>;
    isAuthenticated: boolean;
    isSessionExpired: boolean;
    checkSessionExpiration: () => boolean;
    authEnabled: boolean;
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create provider
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSessionExpired, setIsSessionExpired] = useState(false);

    // Session timeout in milliseconds (from environment variables or runtime config)
    const [sessionTimeout, setSessionTimeout] = useState(env.SESSION_TIMEOUT);

    // Authentication enabled flag (from environment variables or runtime config)
    const [authEnabled, setAuthEnabled] = useState(env.AUTH_ENABLED);

    // Set up API hooks
    const { request: authByCodeRequest, loading: authLoading } = useApi(authApi.authByCode);

    // Update configuration from environment config if available
    useEffect(() => {
        if (typeof window !== "undefined") {
            // First try ENV_CONFIG (new approach)
            if (window.ENV_CONFIG) {
                // Update session timeout
                setSessionTimeout(window.ENV_CONFIG.SESSION_TIMEOUT);

                // Update auth enabled flag
                setAuthEnabled(window.ENV_CONFIG.AUTH_ENABLED);
            }
            // Fall back to RUNTIME_CONFIG (backward compatibility)
            else if (window.RUNTIME_CONFIG) {
                // Update session timeout if defined
                if (window.RUNTIME_CONFIG.SESSION_TIMEOUT !== undefined) {
                    setSessionTimeout(window.RUNTIME_CONFIG.SESSION_TIMEOUT);
                }

                // Update auth enabled flag if defined
                if (window.RUNTIME_CONFIG.AUTH_ENABLED !== undefined) {
                    setAuthEnabled(window.RUNTIME_CONFIG.AUTH_ENABLED);
                }
            }
        }
    }, []);

    // Check if session has expired
    const checkSessionExpiration = () => {
        // If authentication is disabled, never expire the session
        if (!authEnabled) return false;

        const lastActivity = localStorage.getItem("lastActivity");
        const authToken = localStorage.getItem("authToken");

        // If there's no token or no activity record, no need to check expiration
        if (!authToken || !lastActivity) return false;

        const now = Date.now();
        const lastActivityTime = parseInt(lastActivity, 10);
        const isExpired = now - lastActivityTime > sessionTimeout;

        if (isExpired) {
            console.log("Session expired, redirecting to lock page");
            setIsSessionExpired(true);

            // Force a redirect to lock page using window.location for more reliable navigation
            window.location.href = "/auth/lock";
            return true;
        }

        return false;
    };

    // Update last activity timestamp
    const updateLastActivity = () => {
        localStorage.setItem("lastActivity", Date.now().toString());
    };

    // Check if user is logged in on mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                // If authentication is disabled, set a default user and skip the rest
                if (!authEnabled) {
                    setUser({
                        id: 1,
                        name: "Default User",
                        email: "user@example.com",
                        image: "/images/avatar/avatar-3.jpg",
                    });
                    setLoading(false);
                    return;
                }

                // Check if there's an auth token
                const authToken = localStorage.getItem("authToken");

                // If there's no token, we're not authenticated
                if (!authToken) {
                    setUser(null);
                    setLoading(false);
                    return;
                }

                // Check if session is expired
                if (checkSessionExpiration()) {
                    return;
                }

                // Try to get user info
                // try {
                //     const userData = await getUserInfo();
                //     setUser(userData);
                //     updateLastActivity();
                // } catch (error) {
                //     console.error("Error fetching user info:", error);

                //     // If we can't get user info but have a token, use default user
                //     setUser({
                //         id: 1,
                //         name: "Default User",
                //         email: "user@example.com",
                //         image: "/images/avatar/avatar-3.jpg",
                //     });
                //     updateLastActivity();
                // }
                setUser({
                    id: 1,
                    name: "Default User",
                    email: "user@example.com",
                    image: "/images/avatar/avatar-3.jpg",
                });
                updateLastActivity();
            } catch (error) {
                console.error("Authentication error:", error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [authEnabled]);

    // Get user info from API
    const getUserInfo = async (): Promise<User> => {
        try {
            // For demo purposes, we'll use the mock API
            // In production, this would call a real API endpoint
            const response = await apiService({
                url: "/user/info",
                method: "GET",
            });

            return response.data;
        } catch (error) {
            console.error("Error fetching user info:", error);
            throw error;
        }
    };

    // Login function - redirects to lock page for authentication
    const login = async (email: string, _password: string): Promise<boolean> => {
        try {
            setLoading(true);

            // Set a temporary user for the lock screen
            setUser({
                id: 1,
                name: "Default User",
                email: email || "user@example.com",
                image: "/images/avatar/avatar-3.jpg",
            });

            // Set a temporary token to indicate we're in the authentication flow
            localStorage.setItem("tempAuthFlow", "true");

            // Force a redirect to lock page for more reliable navigation
            window.location.href = "/auth/lock";
            return true;
        } catch (error: any) {
            console.error("Login error:", error);
            toast.error("Lỗi xảy ra trong đăng nhập");
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Authenticate with code function (for both login and lock screen)
    const authByCode = async (code: string): Promise<boolean> => {
        try {
            console.log("Authenticating with code:", code);

            // Validate the code - in a real app, this would check against a backend
            // For this example, we'll accept any code that's at least 4 characters
            if (code.length < 4) {
                toast.error("Mã xác thực không hợp lệ");
                return false;
            }

            // Attempt to call the API using the useApi hook
            // Note: The hook handles loading state internally
            await authByCodeRequest(
                {
                    method: "GET",
                    params: { key: code },
                },
                // Success callback
                (response) => {
                    // Update token
                    const token = "auth-token-" + Date.now();
                    localStorage.setItem("authToken", token);
                    document.cookie = `authToken=${token}; path=/; max-age=86400`;

                    // Clear the temporary auth flow flag if it exists
                    localStorage.removeItem("tempAuthFlow");

                    // Reset session expiration
                    updateLastActivity();
                    setIsSessionExpired(false);

                    // Get user info
                    // try {
                    //     const userData = await getUserInfo();
                    //     setUser(userData);
                    // } catch (error) {
                    //     // If API fails, use existing user or default
                    //     setUser({
                    //         id: 1,
                    //         name: "Default User",
                    //         email: "user@example.com",
                    //         image: "/images/avatar/avatar-3.jpg",
                    //     });
                    // }

                    setUser({
                        id: 1,
                        name: "Default User",
                        email: "user@example.com",
                        image: "/images/avatar/avatar-3.jpg",
                    });

                    toast.success("Đăng nhập thành công");

                    // Use window.location for more reliable navigation
                    window.location.href = "/pages/products";
                    return true;
                },
                // Error callback
                (error) => {
                    console.error("Auth code error:", error);
                    // toast.error("Xác thực thất bại. Vui lòng thử lại.");
                }
            );

            return false;
        } catch (error: any) {
            return false;
        }
    };

    // Logout function
    const logout = () => {
        // Mark session as expired
        setIsSessionExpired(true);

        // Clear the token but keep the user info for the lock screen
        localStorage.removeItem("authToken");

        // Clear the cookie by setting it to expire in the past
        document.cookie =
            "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";

        // Force a redirect to lock page
        window.location.href = "/auth/lock";
    };

    // Set up activity monitoring
    useEffect(() => {
        // Check session expiration every minute
        const intervalId = setInterval(() => {
            checkSessionExpiration();
        }, 60 * 1000);

        // Update activity on user interactions
        const updateActivity = () => {
            if (!isSessionExpired) {
                updateLastActivity();
            }
        };

        // Add event listeners for user activity
        window.addEventListener("click", updateActivity);
        window.addEventListener("keypress", updateActivity);
        window.addEventListener("scroll", updateActivity);
        window.addEventListener("mousemove", updateActivity);

        return () => {
            clearInterval(intervalId);
            window.removeEventListener("click", updateActivity);
            window.removeEventListener("keypress", updateActivity);
            window.removeEventListener("scroll", updateActivity);
            window.removeEventListener("mousemove", updateActivity);
        };
    }, [isSessionExpired]);

    // Combine loading states
    const combinedLoading = loading || authLoading;

    const value = {
        user,
        loading: combinedLoading,
        login,
        logout,
        authByCode,
        isAuthenticated: !!user,
        isSessionExpired,
        checkSessionExpiration,
        authEnabled,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Create hook
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
