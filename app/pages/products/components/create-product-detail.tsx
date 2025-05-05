"use client";

import productApi from "@/apis/product/product.api";
import { IProductCreateOrUpdate } from "@/apis/product/product.interface";
import { toast } from "sonner";
import ProductDetail from "./product-detail";
import { useApi } from "@/hooks/useApi";

interface CreateProductDetailProps {
    onClose: () => void;
    onSuccess?: () => void;
}

export default function CreateProductDetail({ onClose, onSuccess }: CreateProductDetailProps) {
    // Set up API hooks
    const { request: createOrUpdateProduct, loading: isCreating } = useApi(
        productApi.createOrUpdateProductDetail
    );

    const handleCreateProduct = async (productData: IProductCreateOrUpdate) => {
        try {
            // Call the API to create or update the product using useApi hook
            await createOrUpdateProduct(
                { body: productData },
                () => {
                    toast.success("Sản phẩm đã được tạo thành công");
                    // Call the onSuccess callback if provided
                    if (onSuccess) {
                        onSuccess();
                    }
                },
                (error) => {
                    console.error("Error creating product:", error);
                    toast.error("Lỗi tạo sản phẩm");
                }
            );
        } catch (error) {
            console.error("Error creating product:", error);
            toast.error("Lỗi tạo sản phẩm");
        }
    };

    return (
        <ProductDetail
            onClose={onClose}
            onSubmit={handleCreateProduct}
            submitButtonText="Tạo mới"
            loadingText="Đang tạo..."
        />
    );
}
