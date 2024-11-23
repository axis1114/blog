import { ReactNode } from "react";

import { createBrowserRouter, RouteObject } from "react-router-dom";
import { WebIndex } from "@/view/frontend/index";
import { WebHome } from "@/view/frontend/home";
import { AdminIndex } from "@/view/backend/index";
import { AdminHome } from "@/view/backend/home";
type BaseRouteType = {
  meta?: {
    name?: string;
    auth?: string;
    icon?: ReactNode;
    label?: string;
    hide?: boolean;
  };
};

export type RouteType = RouteObject &
  BaseRouteType & {
    children?: RouteType[];
  };

export const routerObj: RouteType[] = [
  {
    path: "/",
    element: <WebIndex />,
    children: [{ path: "", element: <WebHome /> }],
  },
  {
    path: "/admin",
    element: <AdminIndex />,
    children: [{ path: "", element: <AdminHome /> }],
  },
];

export const router: any = createBrowserRouter(routerObj, {
  future: {
    v7_fetcherPersist: true,
    v7_normalizeFormMethod: true,
    v7_partialHydration: true,
    v7_relativeSplatPath: true,
    v7_skipActionErrorRevalidation: true,
  },
});
