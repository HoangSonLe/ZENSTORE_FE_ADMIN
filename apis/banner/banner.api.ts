import { apiService } from "../axios";
import { IApiRequestParams, IApiResponseTable } from "../interface";
import { IBanner } from "./banner.interface";

// eslint-disable-next-line import/no-anonymous-default-export
export default {
    getBannerList(
        params: IApiRequestParams<null, null, null>
    ): Promise<IApiResponseTable<IBanner>> {
        return apiService({ url: "/Banner", ...params });
    },
};
