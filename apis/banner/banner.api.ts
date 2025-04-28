import { apiService } from "../axios";
import { IApiRequestParams, IApiResponse, IApiResponseTable } from "../interface";
import { IBanner, IBannerQuery } from "./banner.interface";

// eslint-disable-next-line import/no-anonymous-default-export
export default {
    getBannerList(
        params: IApiRequestParams<null, IBannerQuery, null>
    ): Promise<IApiResponseTable<IBanner[]>> {
        return apiService({ url: "/Banner", ...params });
    },
    getBannerDetail(
        params: IApiRequestParams<null, { bannerId: number }, null>
    ): Promise<IApiResponse<IBanner>> {
        return apiService({ url: "/Banner/FindById", ...params });
    },
    createOrUpdateBannerDetail(
        params: IApiRequestParams<null, null, IBanner>
    ): Promise<IApiResponse<IBanner>> {
        return apiService({ method: "POST", url: "/Banner/Update", ...params });
    },
};
