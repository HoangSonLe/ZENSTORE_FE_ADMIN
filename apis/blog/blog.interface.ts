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
}
export interface IBlogQuery extends IPagingQuery {}
