import { Navigate, Outlet, useLocation } from 'react-router-dom'
import appConfig from '@/configs/app.config'
import useAuth from '@/utils/hooks/useAuth'

const { authenticatedEntryPath } = appConfig

const PublicRoute = () => {
  const { authenticated } = useAuth()
  const location = useLocation()
  
  // Only redirect authenticated users if they're trying to access auth pages (sign-in, sign-up)
  const isAuthPage = location.pathname === '/sign-in' || location.pathname === '/sign-up'
  
  return authenticated && isAuthPage ? <Navigate to={authenticatedEntryPath} /> : <Outlet />
}

export default PublicRoute
