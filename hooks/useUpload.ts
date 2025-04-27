import { useState } from "react";
import uploadApi from "@/apis/upload/upload.api";
import { IApiResponse } from "@/apis/interface";
import { IUploadResponse } from "@/apis/upload/upload.interface";

export type UploadError = {
    message: string;
    isRequiredError?: boolean;
};

export const useUpload = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<UploadError | null>(null);
    const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
    const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);

    /**
     * Upload a single image file
     * @param file - The image file to upload
     * @param onSuccess - Optional callback for success
     * @param onError - Optional callback for error
     */
    const uploadImage = async (
        file: File | null | undefined,
        onSuccess?: (url: string) => void,
        onError?: (error: UploadError) => void
    ): Promise<string | null> => {
        setLoading(true);
        setError(null);

        // Validate file is provided
        if (!file) {
            const requiredError: UploadError = {
                message: "Image field is required",
                isRequiredError: true,
            };
            setError(requiredError);
            onError?.(requiredError);
            setLoading(false);
            return null;
        }

        // Validate file is an image
        if (!uploadApi.isValidImage(file)) {
            const invalidTypeError: UploadError = {
                message: "File must be an image",
                isRequiredError: false,
            };
            setError(invalidTypeError);
            onError?.(invalidTypeError);
            setLoading(false);
            return null;
        }

        try {
            const response = await uploadApi.uploadImage(file);
            const responseData = response as IApiResponse<IUploadResponse>;

            if (responseData.isSuccess && responseData.data?.url) {
                const imageUrl = responseData.data.url;
                setUploadedUrl(imageUrl);
                onSuccess?.(imageUrl);
                return imageUrl;
            } else {
                throw new Error(responseData.errorMessageList?.[0] || "Upload failed");
            }
        } catch (err) {
            console.error("Error uploading image:", err);
            const uploadError: UploadError = {
                message: err instanceof Error ? err.message : "Upload failed",
                isRequiredError: err instanceof Error && err.name === "RequiredImageError",
            };
            setError(uploadError);
            onError?.(uploadError);
            return null;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Upload multiple image files
     * @param files - Array of image files to upload
     * @param onSuccess - Optional callback for success
     * @param onError - Optional callback for error
     */
    const uploadMultipleImages = async (
        files: File[] | null | undefined,
        onSuccess?: (urls: string[]) => void,
        onError?: (error: UploadError) => void
    ): Promise<string[] | null> => {
        setLoading(true);
        setError(null);

        // Validate files are provided
        if (!files || files.length === 0) {
            const requiredError: UploadError = {
                message: "At least one image is required",
                isRequiredError: true,
            };
            setError(requiredError);
            onError?.(requiredError);
            setLoading(false);
            return null;
        }

        // Validate all files are images
        const invalidFiles = files.filter((file) => !uploadApi.isValidImage(file));
        if (invalidFiles.length > 0) {
            const invalidTypeError: UploadError = {
                message: "All files must be images",
                isRequiredError: false,
            };
            setError(invalidTypeError);
            onError?.(invalidTypeError);
            setLoading(false);
            return null;
        }

        try {
            const response = await uploadApi.uploadMultipleImages(files);
            const responseData = response as IApiResponse<IUploadResponse[]>;

            if (responseData.isSuccess && responseData.data) {
                const imageUrls = responseData.data.map((item) => item.url);
                setUploadedUrls(imageUrls);
                onSuccess?.(imageUrls);
                return imageUrls;
            } else {
                throw new Error(responseData.errorMessageList?.[0] || "Upload failed");
            }
        } catch (err) {
            console.error("Error uploading images:", err);
            const uploadError: UploadError = {
                message: err instanceof Error ? err.message : "Upload failed",
                isRequiredError: err instanceof Error && err.name === "RequiredImageError",
            };
            setError(uploadError);
            onError?.(uploadError);
            return null;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Reset the upload state
     */
    const resetUpload = () => {
        setError(null);
        setUploadedUrl(null);
        setUploadedUrls([]);
    };

    return {
        loading,
        error,
        uploadedUrl,
        uploadedUrls,
        uploadImage,
        uploadMultipleImages,
        resetUpload,
        isValidImage: uploadApi.isValidImage,
    };
};
