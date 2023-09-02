export type UserDetails = {
    firstName: string,
    middleName?: string,
    lastName: string,
    extensionName?: string
}

export type UserQuery = {
    userId: string;
}