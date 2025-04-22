import { ECategoryType } from "../../constants/enum";
import { IPagingQuery } from "../interface";

export interface ICategory {
    categoryId: number;
    categoryType: string;
    categoryCode: string;
    categoryName: string;
}
export interface ICategoryQuery extends IPagingQuery {
    searchType?: ECategoryType;
    searchCode?: string;
}
