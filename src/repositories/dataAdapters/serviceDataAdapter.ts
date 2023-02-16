import { Service } from '@graphql/schemas/service';
import { BookingType, UniversityRole } from '@graphql/types';
import { parse } from 'postgres-array';

export type RawService = {
    id: string;
    ts: Date;
    publisher_id: string;
    name: string;
    description: string;
    granularity: number;
    max_time: number;
    booking_type: string;
    allowed_roles: string;
    tags: string[];
};

const adapt = (rawService: RawService): Service => ({
    ...rawService,
    allowed_roles: parse(rawService.allowed_roles) as UniversityRole[],
    booking_type: rawService.booking_type as BookingType,
});

export default adapt;
