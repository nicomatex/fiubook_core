import { AuthChecker } from 'type-graphql'
import type { ContextType } from '@graphql/types'

export const authChecker: AuthChecker<ContextType> = (
    { root, args, context, info },
    roles
) => {
    console.log(context)
    return true
}

export default authChecker