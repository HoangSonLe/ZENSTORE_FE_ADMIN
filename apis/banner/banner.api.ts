import { apiService } from "../axios";
import { IApiRequestParams, IApiResponse, IApiResponseTable } from "../interface";
import { IBanner, IBannerBody } from "./banner.interface";

// eslint-disable-next-line import/no-anonymous-default-export
export default {
    getBannerList(
        params: IApiRequestParams<null, null, null>
    ): Promise<IApiResponseTable<IBanner>> {
        return apiService({ url: "/Banner", ...params });
    },
    updateImageBanner(
        params: IApiRequestParams<null, null, IBannerBody>
    ): Promise<IApiResponse<null>> {
        return apiService({ method: "POST", url: "/Banner/Update", ...params });
    },
};
