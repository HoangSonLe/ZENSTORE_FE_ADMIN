import { EBannerOrder } from "../../constants/enum";

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
export interface IBannerBody {
    bannerId: number;
    bannerImage: string;
}
