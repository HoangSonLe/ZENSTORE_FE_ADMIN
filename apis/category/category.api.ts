import { apiService } from "../axios";
import { IApiRequestParams, IApiResponseTable } from "../interface";
import { ICategory, ICategoryQuery } from "./category.interface";

// eslint-disable-next-line import/no-anonymous-default-export
export default {
    getCategoryDataOptions(
        params: IApiRequestParams<null, ICategoryQuery, null>
    ): Promise<IApiResponseTable<ICategory>> {
        return apiService({ url: "/Category", ...params });
    },
};
