import { IPagingQuery } from "../interface";

export interface ITemplate {
    templateId: number;
    templateCode: string;
    templateName: string;
    templateDetailContent: string;
}

export interface ITemplateQuery extends IPagingQuery {
    templateCode?: string;
}
