import { apiService } from "../axios";
import { IApiRequestParams, IApiResponseTable } from "../interface";
import { ITemplate, ITemplateQuery } from "./template.interface";

// eslint-disable-next-line import/no-anonymous-default-export
export default {
    GetTemplateList(
        params: IApiRequestParams<null, ITemplateQuery, null>
    ): Promise<IApiResponseTable<ITemplate>> {
        return apiService({ url: "/Template/GetTemplateList", ...params });
    },
};
