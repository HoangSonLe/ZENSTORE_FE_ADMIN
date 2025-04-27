import { apiService } from "../axios";
import { IApiResponse } from "../interface";
import { IUploadResponse } from "./upload.interface";

class RequiredImageError extends Error {
    constructor(message: string = "Image field is required") {
        super(message);
        this.name = "RequiredImageError";
    }
}

// eslint-disable-next-line import/no-anonymous-default-export
export default {
    /**
     * Upload a single image file
     * @param file - The image file to upload
     * @returns Promise with the upload response containing the image URL
     * @throws RequiredImageError if file is null or undefined
     */
    uploadImage(file: File | null | undefined): Promise<IApiResponse<IUploadResponse>> {
        if (!file) {
            return Promise.reject(new RequiredImageError());
        }

        const formData = new FormData();
        formData.append("file", file);

        return apiService({
            method: "POST",
            url: "/Upload/Image",
            body: formData,
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },

    /**
     * Upload multiple image files
     * @param files - Array of image files to upload
     * @returns Promise with the upload response containing the image URLs
     * @throws RequiredImageError if files array is empty, null or undefined
     */
    uploadMultipleImages(
        files: File[] | null | undefined
    ): Promise<IApiResponse<IUploadResponse[]>> {
        if (!files || files.length === 0) {
            return Promise.reject(new RequiredImageError("At least one image is required"));
        }

        const formData = new FormData();

        files.forEach((file, index) => {
            formData.append(`files[${index}]`, file);
        });

        return apiService({
            method: "POST",
            url: "/Upload/Images",
            body: formData,
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },

    /**
     * Check if a file is a valid image
     * @param file - The file to check
     * @returns boolean indicating if the file is a valid image
     */
    isValidImage(file: File | null | undefined): boolean {
        if (!file) return false;

        // Check if the file is an image
        return file.type.startsWith("image/");
    },
};
