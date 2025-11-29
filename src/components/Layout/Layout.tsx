import React, {lazy, Suspense, useMemo} from "react";
import useAuth from "@/utils/hooks/useAuth";
import useLocale from "@/utils/hooks/useLocale";
import LoadingScreen from "@/components/LoadingScreen/LoadingScreen";
import {LayoutTypes} from "@/@types/layout";
import {useAppSelector} from "@/store";

const layouts:any = {
  [LayoutTypes.SimpleSideBar]: lazy(() => import('./LayoutTypes/SimpleSideBar')),
  [LayoutTypes.DeckedSideBar]: lazy(() => import('./LayoutTypes/DeckedSideBar')),
  [LayoutTypes.CollapsedSideBar]: lazy(() => import('./LayoutTypes/CollapsedSideBar')),
}

import { useLocation } from 'react-router-dom';

import FriendsWidget from "@/components/Social/FriendsWidget";

import { GlobalBackground } from "./GlobalBackground";

export function Layout() {
  const {authenticated} = useAuth()
  const layoutType = useAppSelector((state) => state.theme.currentLayout)
  const location = useLocation()

  useLocale()

  const AppLayout = useMemo(() => {
    if (authenticated) {
     return layouts[layoutType]
    }
    
    // List of paths that should use AuthLayout (login/signup pages)
    const authPaths = ['/sign-in', '/sign-up', '/forgot-password', '/reset-password'];
    const isAuthPath = authPaths.some(path => location.pathname.includes(path));

    if (isAuthPath) {
      return lazy(() => import('./AuthLayout'))
    }

    // For other public pages (dashboard, etc.), use the main layout even if not authenticated
    return layouts[layoutType]
  }, [authenticated, layoutType, location.pathname])

  return (
    <Suspense
      fallback={
        <div className="flex flex-auto flex-col h-[100vh]">
          <LoadingScreen/>
        </div>
      }
    >
      <GlobalBackground />
      <AppLayout/>
      {authenticated && <FriendsWidget />}
    </Suspense>
  );
}
