import { EBannerOrder } from "../../constants/enum";
import { IPagingQuery } from "../interface";

export interface IBanner {
    bannerId: number;
    bannerSubTitle: string | null;
    bannerTitle: string;
    bannerCode: string;
    bannerName: string;
    bannerTypeCode: EBannerOrder;
    bannerTypeName: string;
    bannerImage: string;
    createdAt: string; // or Date if you parse it
    updatedAt: string; // or Date if you parse it
}

export interface IBannerCreateOrUpdate extends Omit<IBanner, "createdAt" | "updatedAt"> {
    uploadFile?: string;
}

export interface IBannerQuery extends IPagingQuery {
    keyword?: string;
    state?: boolean;
    bannerTypeCode?: EBannerOrder;
}
