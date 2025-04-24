import { apiService } from "../axios";
import { IApiRequestParams, IApiResponse, IApiResponseTable } from "../interface";
import { IProduct, IProductQuery } from "./product.interface";

// eslint-disable-next-line import/no-anonymous-default-export
export default {
    getProductList(
        params: IApiRequestParams<null, IProductQuery, null>
    ): Promise<IApiResponseTable<IProduct>> {
        return apiService({ url: "/Product/GetProductList", ...params });
    },
    getProductDetail(
        params: IApiRequestParams<null, { productId: number }, null>
    ): Promise<IApiResponse<IProduct>> {
        return apiService({ url: "/Product/FindById", ...params });
    },
    createOrUpdateProductDetail(
        params: IApiRequestParams<null, IProduct, null>
    ): Promise<IApiResponse<IProduct>> {
        return apiService({ url: "/Product/CreateorUpdate", ...params });
    },
    deleteProductById(
        params: IApiRequestParams<null, { productId: number }, null>
    ): Promise<IApiResponse<IProduct>> {
        return apiService({ url: "/Product/DeleteById", ...params });
    },
};
