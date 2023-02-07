import { UniversityRole } from '@graphql/types';
import { DatabaseUser } from '@repositories/types';
import { parse } from 'postgres-array';

export type RawUser = {
    id: string
    ts: Date
    dni: string
    roles: string
    can_publish_services: boolean
    is_admin: boolean
}

const adapt = (rawUser: RawUser): DatabaseUser => ({
    ...rawUser,
    roles: parse(rawUser.roles) as UniversityRole[],
});

export default adapt;
