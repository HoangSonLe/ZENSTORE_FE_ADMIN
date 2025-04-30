import { IPagingQuery } from "../interface";

export interface IBlog {
    newsId: number;
    newsTitle: string;
    newsBanner: string;
    newsThumbnail: string;
    newsDetailContent: string;
    newsShortContent: string;
    state: boolean;
    createdAt: string;
    uploadFile?: string; // For handling image upload
}

export interface IBlogCreateOrUpdate extends Omit<IBlog, "createdAt"> {
    uploadFile?: string;
}

export interface IBlogQuery extends IPagingQuery {
    keyword?: string;
    state?: boolean;
}
