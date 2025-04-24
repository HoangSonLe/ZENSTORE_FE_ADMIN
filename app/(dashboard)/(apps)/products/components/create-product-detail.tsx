"use client";

import { IProduct } from "@/apis/product/product.interface";
import { toast } from "react-hot-toast";
import ProductDetail from "./product-detail";
import productApi from "@/apis/product/product.api";

interface CreateProductDetailProps {
    onClose: () => void;
    onSuccess?: () => void;
}

export default function CreateProductDetail({ onClose, onSuccess }: CreateProductDetailProps) {
    const handleCreateProduct = async (productData: Partial<IProduct>) => {
        try {
            // Call the API to create or update the product
            await productApi.createOrUpdateProductDetail({
                params: productData as IProduct,
            });

            toast.success("Product created successfully");

            // Call the onSuccess callback if provided
            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error("Error creating product:", error);
            toast.error("Failed to create product");
            throw error;
        }
    };

    return (
        <ProductDetail
            onClose={onClose}
            onSubmit={handleCreateProduct}
            submitButtonText="Create Product"
            loadingText="Creating..."
        />
    );
}
