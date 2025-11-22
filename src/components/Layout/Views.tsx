import { Suspense } from 'react'
import appConfig from '@/configs/app.config'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAppSelector } from '@/store'
import {protectedRoutes, publicRoutes, authRoute} from "@/configs/routes.config";
import ProtectedRoute from "@/route/ProtectedRoute";
import AppRoute from "@/route/AppRoute";
import AuthorityGuard from "@/route/AuthorityGuard";
import PublicRoute from "@/route/PublicRoute";
import LoadingScreen from "@/components/LoadingScreen/LoadingScreen";

interface ViewsProps {
  pageContainerType?: 'default' | 'gutterless' | 'contained'
  // layout?: LayoutType
}

type AllRoutesProps = ViewsProps

const { authenticatedEntryPath } = appConfig

const AllRoutes = (props: AllRoutesProps) => {
  const userAuthority = useAppSelector((state) => state.auth.user.role)

  return (
    <Routes>
      <Route path="/" element={<Navigate replace to="/dashboard" />} />
      <Route path="/" element={<ProtectedRoute />}>
        {protectedRoutes.map((route, index) => {
          return <Route
            key={route.key + index}
            path={route.path}
            element={
              <AuthorityGuard
                userAuthority={userAuthority}
                authority={route.authority}
              >
                  <AppRoute
                    routeKey={route.key}
                    component={route.component}
                    {...route.authority}
                  />
              </AuthorityGuard>
            }
          />
        })}
        <Route path="*" element={<Navigate replace to="/" />} />
      </Route>
      <Route path="/" element={<PublicRoute />}>
        {authRoute.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={
              <AppRoute
                routeKey={route.key}
                component={route.component}
              />
            }
          />
        ))}
      </Route>
      {publicRoutes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={
            route.authority && route.authority.length > 0 ? (
              <AuthorityGuard
                userAuthority={userAuthority}
                authority={route.authority}
              >
                <AppRoute
                  routeKey={route.key}
                  component={route.component}
                />
              </AuthorityGuard>
            ) : (
              <AppRoute
                routeKey={route.key}
                component={route.component}
              />
            )
          }
        />
      ))}
    </Routes>
  )
}

const Views = (props: ViewsProps) => {
  return (
    <Suspense fallback={
      <LoadingScreen/>
    }>
      <AllRoutes {...props} />
    </Suspense>
  )
}

export default Views
