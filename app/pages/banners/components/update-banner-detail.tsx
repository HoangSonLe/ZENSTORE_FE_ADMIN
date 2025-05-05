"use client";

import bannerApi from "@/apis/banner/banner.api";
import { IBanner, IBannerCreateOrUpdate } from "@/apis/banner/banner.interface";
import { toast } from "sonner";
import BannerDetail from "./banner-detail";
import { useApi } from "@/hooks/useApi";

interface UpdateBannerDetailProps {
    banner: IBanner;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function UpdateBannerDetail({
    banner,
    onClose,
    onSuccess,
}: UpdateBannerDetailProps) {
    // Set up API hooks
    const { request: updateBanner } = useApi(bannerApi.createOrUpdateBannerDetail);

    const handleUpdateBanner = async (bannerData: IBannerCreateOrUpdate) => {
        try {
            // Merge the existing banner with the updated data
            const updatedBanner: IBannerCreateOrUpdate = {
                ...banner,
                ...bannerData,
            };

            // Call the API to update the banner using the useApi hook
            await updateBanner(
                {
                    body: updatedBanner as any, // Use type assertion to handle type mismatch
                    method: "POST",
                },
                // Success callback
                () => {
                    toast.success("Banner đã được cập nhật thành công");

                    // Call the onSuccess callback if provided
                    if (onSuccess) {
                        onSuccess();
                    }
                },
                // Error callback
                (error) => {
                    console.error("Error updating banner:", error);
                    toast.error("Lỗi cập nhật banner");
                }
            );
        } catch (error) {
            console.error("Error in handleUpdateBanner:", error);
            toast.error("Lỗi cập nhật banner");
            throw error;
        }
    };

    return (
        <BannerDetail
            bannerId={banner.bannerId}
            initialData={banner as IBannerCreateOrUpdate}
            onClose={onClose}
            onSubmit={handleUpdateBanner}
            submitButtonText="Lưu thay đổi"
            loadingText="Đang lưu..."
        />
    );
}
