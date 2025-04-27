import { apiService } from "../axios";
import { IApiRequestParams, IApiResponse, IApiResponseTable } from "../interface";
import { IProduct, IProductCreateOrUpdate, IProductQuery } from "./product.interface";

// eslint-disable-next-line import/no-anonymous-default-export
export default {
    getProductList(
        params: IApiRequestParams<null, IProductQuery, null>
    ): Promise<IApiResponseTable<IProduct>> {
        return apiService({ url: "/Product/GetProductList", ...params });
    },
    getProductDetailById(
        params: IApiRequestParams<null, { productId: number }, null>
    ): Promise<IApiResponse<IProduct>> {
        return apiService({ url: "/Product/FindById", ...params });
    },
    createOrUpdateProductDetail(
        params: IApiRequestParams<null, null, IProductCreateOrUpdate>
    ): Promise<IApiResponse<IProduct>> {
        return apiService({ method: "POST", url: "/Product/CreateorUpdate", ...params });
    },
    deleteProductById(
        params: IApiRequestParams<null, { productId: number }, null>
    ): Promise<IApiResponse<IProduct>> {
        return apiService({ url: "/Product/DeleteById", ...params });
    },
};
