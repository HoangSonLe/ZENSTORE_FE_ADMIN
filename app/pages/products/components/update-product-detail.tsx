"use client";

import productApi from "@/apis/product/product.api";
import { IProductCreateOrUpdate } from "@/apis/product/product.interface";
import { toast } from "sonner";
import ProductDetail from "./product-detail";
import { useApi } from "@/hooks/useApi";

interface UpdateProductDetailProps {
    product: IProductCreateOrUpdate;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function UpdateProductDetail({
    product,
    onClose,
    onSuccess,
}: UpdateProductDetailProps) {
    // Set up API hooks
    const { request: createOrUpdateProduct, loading: isUpdating } = useApi(
        productApi.createOrUpdateProductDetail
    );

    const handleUpdateProduct = async (productData: IProductCreateOrUpdate) => {
        try {
            // Merge the existing product with the updated data
            const updatedProduct: IProductCreateOrUpdate = {
                ...product,
                ...productData,
            };

            // Call the API to create or update the product using useApi hook
            await createOrUpdateProduct(
                { body: updatedProduct },
                () => {
                    toast.success("Sản phẩm đã được lưu thành công");
                    // Call the onSuccess callback if provided
                    if (onSuccess) {
                        onSuccess();
                    }
                },
                (error) => {
                    console.error("Error updating product:", error);
                    toast.error("Lỗi lưu sản phẩm");
                    throw error;
                }
            );
        } catch (error) {
            console.error("Error updating product:", error);
            toast.error("Lỗi lưu sản phẩm");
            throw error;
        }
    };

    return (
        <ProductDetail
            productId={product.productId}
            initialData={product}
            onClose={onClose}
            onSubmit={handleUpdateProduct}
            submitButtonText="Lưu thay đổi"
            loadingText="Đang lưu..."
        />
    );
}
