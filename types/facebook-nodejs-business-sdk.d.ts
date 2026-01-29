declare module 'facebook-nodejs-business-sdk' {
    export class FacebookAdsApi {
        static init(accessToken: string): FacebookAdsApi;
    }

    export class AdAccount {
        constructor(accountId: string);
        getInsights(
            fields: string[],
            params: Record<string, unknown>
        ): Promise<Array<{
            spend?: string;
            impressions?: string;
            clicks?: string;
            date_start?: string;
            date_stop?: string;
            campaign_name?: string;
            campaign_id?: string;
            [key: string]: unknown;
        }>>;
    }
}
