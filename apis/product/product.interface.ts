import { EProductStatus } from "../../constants/enum";
import { IPagingQuery } from "../interface";

export interface IProduct {
    productId: number;
    productName: string;
    productStatusCode: string | EProductStatus;
    productStatusName: string;
    productSpaceCode: string;
    productSpaceName: string;
    productSeriesCode: string;
    productSeriesName: string;
    productColorCode: string;
    productColorName: string;
    productPrice: string;
    productPriceSale: string;
    productImage: string;
    listImage: string[];
    productShortDetail: string;
    productDetail: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface IProductCreateOrUpdate extends Omit<IProduct, "createdAt" | "updatedAt"> {
    uploadFiles: string[];
}
export interface IProductQuery extends IPagingQuery {
    seriCode?: string;
    colorCode?: string;
    spaceCode?: string;
    statusCodes?: string[];
    directionSort?: number | null;
}
