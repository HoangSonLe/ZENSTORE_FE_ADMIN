import { apiService } from "../axios";
import { IApiRequestParams, IApiResponseValue, IBaseApiResponse } from "../interface";

// eslint-disable-next-line import/no-anonymous-default-export
export default {
    authByCode(params: IApiRequestParams<null, { key: string }, null>): Promise<IBaseApiResponse> {
        return apiService({ method: "GET", url: "/account/login", ...params });
    },
};
