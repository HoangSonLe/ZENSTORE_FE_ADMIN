import { IApiResponse, IApiService } from "./interface";
import axios, { AxiosResponse } from "axios";
import queryString from "query-string";
import env from "../constants/env";
import { useCallback, useEffect, useState } from "react";
import { toast as stoast } from "sonner";

// Define the global environment config type
declare global {
    interface Window {
        ENV_CONFIG?: {
            API_URL: string;
            SITE_NAME: string;
            AUTH_ENABLED: boolean;
            SESSION_TIMEOUT: number;
            BASE_URL: string;
        };
        RUNTIME_CONFIG?: {
            API_URL: string;
            BASE_URL: string;
        };
    }
}

// Get API URL from environment or runtime config if available
const getApiUrl = () => {
    if (typeof window !== "undefined") {
        // First try ENV_CONFIG (new approach)
        if (window.ENV_CONFIG?.API_URL) {
            return window.ENV_CONFIG.API_URL;
        }
        // Fall back to RUNTIME_CONFIG (backward compatibility)
        if (window.RUNTIME_CONFIG?.API_URL) {
            return window.RUNTIME_CONFIG.API_URL;
        }
    }
    // Default to env from constants
    return env.API_URL;
};

// Create an Axios instance
const axiosInstance = axios.create({
    baseURL: getApiUrl(), // Get API URL from config
    timeout: 10000,
});

// Request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("authToken"); // or from context/redux
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

const handleErrorResponse = (response: AxiosResponse<any, any>) => {
    try {
        console.log(response);
        const errorMessage = response.statusText;

        if (errorMessage) {
            stoast.error(errorMessage);
        } else {
            stoast.error("Thất bại!");
        }
        return Promise.reject(response);
    } catch (error) {
        console.log("error", error);
        return Promise.reject(error);
    }
};

const handleSuccessResponse = (response: AxiosResponse<any, any>) => {
    try {
        const responseCast = response.data as IApiResponse<any>;
        if (responseCast.isSuccess === true) {
            return response.data;
        } else if (responseCast.isSuccess === false) {
            responseCast.errorMessageList.forEach((msg) => stoast.error(msg));
            return Promise.reject(response);
        }
        return response;
    } catch (error) {
        console.log("error", error);
        return response;
    }
};

// Response interceptor
axiosInstance.interceptors.response.use(
    (response) => handleSuccessResponse(response),
    (error) => handleErrorResponse(error)
);
export const apiService = ({
    url,
    pathVars,
    params,
    body,
    ...options
}: IApiService): Promise<any> => {
    let updatedUrl = url;

    if (pathVars && Object.keys(pathVars).length !== 0) {
        updatedUrl = Object.entries(pathVars).reduce(
            (replacedPath, [key, value]) => replacedPath.replace(`:${key}`, `${value || ""}`),
            url || ""
        );
    }

    if (params && Object.keys(params).length !== 0) {
        updatedUrl = `${updatedUrl}?${queryString.stringify(params)}`;
    }

    return axiosInstance({
        data: body,
        url: updatedUrl,
        ...options,
    });
};

export default axiosInstance;
