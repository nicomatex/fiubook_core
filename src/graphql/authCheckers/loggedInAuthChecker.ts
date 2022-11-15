import { ContextType } from '@graphql/types'
import { ResolverData } from 'type-graphql'

const LoggedInAuthChecker = ({
    root,
    args,
    context,
    info,
}: ResolverData<ContextType>): boolean => {
    return context.isLoggedIn
}

export default LoggedInAuthChecker
