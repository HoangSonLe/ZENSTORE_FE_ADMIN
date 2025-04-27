export interface IUploadResponse {
    isSuccess: boolean;
    message: string;
    data: {
        url: string;
    };
}
