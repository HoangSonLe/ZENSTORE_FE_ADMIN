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
    productPrice: number;
    productPriceSale: number;
    productImage: string;
    listImage: string[];
    productShortDetail: string;
    productDetail: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface IProductQuery extends IPagingQuery {
    seriCode?: string;
    colorCode?: string;
    spaceCode?: string;
    statusCode?: string[];
}
