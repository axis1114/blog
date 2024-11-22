import { ReactNode } from "react";

import { createBrowserRouter, RouteObject } from "react-router-dom";

type BaseRouteType = {
  meta?: {
    name?: string;
    auth?: string;
    icon?: ReactNode;
    label?: string;
  };
};

export type RouteType = RouteObject &
  BaseRouteType & {
    children?: RouteType[];
  };

export const routerObj: RouteType[] = [];

export const router: any = createBrowserRouter(routerObj);
