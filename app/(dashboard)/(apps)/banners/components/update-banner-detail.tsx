"use client";

import bannerApi from "@/apis/banner/banner.api";
import { IBanner, IBannerBody } from "@/apis/banner/banner.interface";
import { toast } from "sonner";
import BannerDetail from "./banner-detail";

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
    const handleUpdateBanner = async (bannerData: IBannerBody) => {
        try {
            // Call the API to update the banner
            await bannerApi.updateImageBanner({
                body: bannerData,
            });

            toast.success("Banner đã được cập nhật thành công");

            // Call the onSuccess callback if provided
            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error("Error updating banner:", error);
            toast.error("Lỗi cập nhật banner");
            throw error;
        }
    };

    return (
        <BannerDetail
            banner={banner}
            onClose={onClose}
            onSubmit={handleUpdateBanner}
            submitButtonText="Lưu thay đổi"
            loadingText="Đang lưu..."
        />
    );
}
