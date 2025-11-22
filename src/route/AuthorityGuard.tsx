import { PropsWithChildren } from 'react'
import { Navigate } from 'react-router-dom'
import useAuthority from '@/utils/hooks/useAuthority'

type AuthorityGuardProps = PropsWithChildren<{
  userAuthority?: string
  authority?: string[]
}>

const AuthorityGuard = (props: AuthorityGuardProps) => {
  const { userAuthority = '', authority = [], children } = props

  const roleMatched = useAuthority(userAuthority, authority)

  // For admin-only routes, return 404 instead of access-denied to hide route existence
  const isAdminRoute = authority.includes('admin')
  const redirectPath = isAdminRoute ? '/404' : '/access-denied'

  return <>{roleMatched ? children : <Navigate to={redirectPath} />}</>
}

export default AuthorityGuard
