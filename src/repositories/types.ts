type PaginatedQueryResult<Type> = {
    data: Type[]
    paginationToken?: string
}

export { PaginatedQueryResult }
