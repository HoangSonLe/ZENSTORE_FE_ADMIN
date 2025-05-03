import { apiService } from "../axios";
import { IApiRequestParams, IApiResponseValue } from "../interface";

// eslint-disable-next-line import/no-anonymous-default-export
export default {
    authByCode(
        params: IApiRequestParams<null, { code: string }, null>
    ): Promise<IApiResponseValue<string>> {
        return apiService({ url: "/auth", ...params });
    },
};
