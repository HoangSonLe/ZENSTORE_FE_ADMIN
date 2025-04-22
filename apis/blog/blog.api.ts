import { apiService } from "../axios";
import { IApiRequestParams, IApiResponse, IApiResponseTable } from "../interface";
import { IBlog, IBlogQuery } from "./blog.interface";

// eslint-disable-next-line import/no-anonymous-default-export
export default {
    getBlogList(
        params: IApiRequestParams<null, IBlogQuery, null>
    ): Promise<IApiResponseTable<IBlog[]>> {
        return apiService({ url: "/New/GetNewsList", ...params });
    },
    getBlogDetail(
        params: IApiRequestParams<null, { newId: number }, null>
    ): Promise<IApiResponse<IBlog>> {
        return apiService({ url: "/New/FindById", ...params });
    },
};
