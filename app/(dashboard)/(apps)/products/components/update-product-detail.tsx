"use client";

import { IProduct } from "@/apis/product/product.interface";
import { toast } from "react-hot-toast";
import ProductDetail from "./product-detail";
import productApi from "@/apis/product/product.api";

interface UpdateProductDetailProps {
    product: IProduct;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function UpdateProductDetail({
    product,
    onClose,
    onSuccess,
}: UpdateProductDetailProps) {
    const handleUpdateProduct = async (productData: Partial<IProduct>) => {
        try {
            // Merge the existing product with the updated data
            const updatedProduct: IProduct = {
                ...product,
                ...productData,
            };

            // Call the API to create or update the product
            await productApi.createOrUpdateProductDetail({
                params: updatedProduct,
            });

            toast.success("Product updated successfully");

            // Call the onSuccess callback if provided
            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error("Error updating product:", error);
            toast.error("Failed to update product");
            throw error;
        }
    };

    return (
        <ProductDetail
            initialData={product}
            onClose={onClose}
            onSubmit={handleUpdateProduct}
            submitButtonText="Save Changes"
            loadingText="Saving..."
        />
    );
}
