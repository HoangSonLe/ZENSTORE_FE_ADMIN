import { ECategoryType } from "../../constants/enum";
import { IPagingQuery } from "../interface";

export interface ICategory {
    categoryId: number;
    categoryType: ECategoryType;
    categoryCode: string;
    categoryName: string;
}
export interface ICategoryQuery extends IPagingQuery {
    searchType?: ECategoryType;
    searchCode?: string;
}
