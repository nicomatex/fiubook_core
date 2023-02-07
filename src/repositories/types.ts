type PaginatedQueryResult<Type> = {
    data: Type[]
    paginationToken?: string
}

enum BookingType {
    AUTOMATIC = 'AUTOMATIC',
    REQUIRES_CONFIRMATION = 'REQUIRES_CONFIRMATION',
}

enum UniversityRole {
    STUDENT = 'STUDENT',
    PROFESSOR = 'PROFESSOR',
    NODO = 'NODO',
}

enum BookingStatus {
    PENDING_CONFIRMATION = 'PENDING_CONFIRMATION',
    CONFIRMED = 'CONFIRMED',
    CANCELLED = 'CANCELLED',
}

type DatabaseUser = {
    id: string
    ts: Date
    dni: string
    roles: UniversityRole[]
    can_publish_services: boolean
    is_admin: boolean
}

type DatabaseService = {
    id: string
    ts: Date
    publisher_id: string
    name: string
    description: string
    granularity: number
    min_time: number
    max_time?: number
    booking_type: BookingType
    allowed_roles: UniversityRole[]
}

type DatabaseBooking = {
    id: string
    ts: Date
    service_id: string
    requestor_id: string
    publisher_id: string
    start_date: Date
    end_date: Date
    booking_status: BookingStatus
}

export {
    PaginatedQueryResult,
    DatabaseUser,
    DatabaseService,
    DatabaseBooking,
    BookingType,
    UniversityRole,
    BookingStatus,
};
