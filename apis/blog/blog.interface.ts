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
    uploadFiles?: string[]; // For handling image uploads
}

export interface IBlogCreateOrUpdate extends Omit<IBlog, "createdAt"> {
    uploadFiles?: string[];
}

export interface IBlogQuery extends IPagingQuery {
    keyword?: string;
    state?: boolean;
}
