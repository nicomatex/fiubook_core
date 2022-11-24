import { ContextType } from '@graphql/types'
import { ResolverData } from 'type-graphql'

const LoggedInAuthChecker = ({
    root,
    args,
    context,
    info,
}: ResolverData<ContextType>): boolean => {
    const array = Array()
    return context.isLoggedIn
}

export default LoggedInAuthChecker
