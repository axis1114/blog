import { ReactNode } from "react";

import { createBrowserRouter, RouteObject } from "react-router-dom";
import { WebIndex } from "@/view/frontend/index";
import { WebHome } from "@/view/frontend/home";
import { AdminIndex } from "@/view/backend/index";
import { AdminHome } from "@/view/backend/home";
import { AdminLogin } from "@/components/login/login";
import { AuthGuard } from "@/components/authguard/authguard";
import { AdminArticle } from "@/view/backend/artilce";
import { AdminImage } from "@/view/backend/image";
import { ArticleDetail } from "@/components/detail/detail";
import { AdminUser } from "@/view/backend/user";
import { AdminComment } from "@/view/backend/comment";
import { AdminCategory } from "@/view/backend/category";
import { AdminFriendlink } from "@/view/backend/friendlink";
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
    children: [{ path: "", element: <WebHome /> }, { path: "article/:id", element: <ArticleDetail /> }],
  },
  {
    path: "/login",
    element: <AdminLogin />,
  },
  {
    path: "/admin",
    element: (
      <AuthGuard>
        <AdminIndex />
      </AuthGuard>
    ),
    children: [
      { path: "", element: <AdminHome /> },
      { path: "articles", element: <AdminArticle /> },
      { path: "comments", element: <AdminComment /> },
      { path: "images", element: <AdminImage /> },
      { path: "users", element: <AdminUser /> },
      { path: "categories", element: <AdminCategory /> },
      { path: "friendlinks", element: <AdminFriendlink /> },
    ],
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
