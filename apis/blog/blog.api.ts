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
    createOrUpdateBlogDetail(
        params: IApiRequestParams<null, null, IBlog>
    ): Promise<IApiResponse<IBlog>> {
        return apiService({ method: "POST", url: "/New/Update", ...params });
    },
    deleteBlog(
        params: IApiRequestParams<null, { newId: number }, null>
    ): Promise<IApiResponse<boolean>> {
        return apiService({ method: "DELETE", url: "/New/Delete", ...params });
    },
};
