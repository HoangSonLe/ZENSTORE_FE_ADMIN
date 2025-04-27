"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { apiService } from "@/apis/axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

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
    isAuthenticated: boolean;
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create provider
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Check if user is logged in on mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Temporarily always fetch user info regardless of token
                // This skips validation for development purposes
                const userData = await getUserInfo();
                setUser(userData);

                // Store a token if one doesn't exist
                if (!localStorage.getItem("authToken")) {
                    localStorage.setItem("authToken", "temp-token-" + Date.now());
                }
            } catch (error) {
                console.error("Authentication error:", error);
                // Even on error, we'll set a default user for development
                setUser({
                    id: 1,
                    name: "Default User",
                    email: "user@example.com",
                    image: "/images/avatar/avatar-3.jpg",
                });
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

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

    // Login function
    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            setLoading(true);

            // Temporarily simplified login that always succeeds
            // In a real application, this would validate credentials

            // Generate a token
            const token = "temp-token-" + Date.now();
            localStorage.setItem("authToken", token);
            document.cookie = `authToken=${token}; path=/; max-age=86400`;

            // Get or create user info
            try {
                const userData = await getUserInfo();
                setUser(userData);
            } catch (error) {
                // If API fails, use default user
                setUser({
                    id: 1,
                    name: "Default User",
                    email: email || "user@example.com",
                    image: "/images/avatar/avatar-3.jpg",
                });
            }

            toast.success("Login Successful");
            return true;
        } catch (error: any) {
            console.error("Login error:", error);

            // Even on error, login succeeds for development
            const token = "temp-token-" + Date.now();
            localStorage.setItem("authToken", token);
            document.cookie = `authToken=${token}; path=/; max-age=86400`;

            setUser({
                id: 1,
                name: "Default User",
                email: email || "user@example.com",
                image: "/images/avatar/avatar-3.jpg",
            });

            toast.success("Login Successful");
            return true;
        } finally {
            setLoading(false);
        }
    };

    // Logout function
    const logout = () => {
        localStorage.removeItem("authToken");
        setUser(null);
        router.push("/auth/login");
    };

    const value = {
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
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
