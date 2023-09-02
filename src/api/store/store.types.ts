export type StoreQuery = {
    storeId: string;
};

export type StoreCreate = {
    name: string;
    addressLine: string;
    city: string;
    province: string;
    region: string;
}