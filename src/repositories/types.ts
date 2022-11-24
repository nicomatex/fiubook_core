type PaginatedQueryResult<Type> = {
    data: Type[]
    paginationToken?: string
}

// eslint-disable-next-line import/prefer-default-export
export { PaginatedQueryResult };
