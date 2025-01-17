// 导入必要的路由相关组件和页面组件
import { AuthGuard } from "@/components/authguard/authguard";
import { ArticleDetail } from "@/components/detail/detail";
import { AdminLogin } from "@/components/login/login";
import { NotFound } from "@/components/notfound/notfound";
import { AdminArticle } from "@/view/backend/article";
import { AdminCategory } from "@/view/backend/category";
import { AdminComment } from "@/view/backend/comment";
import { AdminFriendlink } from "@/view/backend/friendlink";
import { AdminHome } from "@/view/backend/home";
import { AdminImage } from "@/view/backend/image";
import { AdminIndex } from "@/view/backend/index";
import { AdminSetting } from "@/view/backend/setting";
import { AdminUser } from "@/view/backend/user";
import { WebHome } from "@/view/frontend/home";
import { WebAbout } from "@/view/frontend/about";
import { WebIndex } from "@/view/frontend/index";
import { WebArchives } from "@/view/frontend/archives";
import { createBrowserRouter, RouteObject } from "react-router-dom";

// 定义基础路由类型，包含元数据接口
type BaseRouteType = {
  meta?: {
    auth?: string; // 用于标识是否需要权限验证
  };
};

// 扩展路由对象类型，继承自 RouteObject 并包含自定义属性
export type RouteType = RouteObject &
  BaseRouteType & {
    children?: RouteType[]; // 子路由配置
  };

// 路由配置数组s
export const routerObj: RouteType[] = [
  {
    path: "/", // 前台根路由
    element: <WebIndex />,
    children: [
      { path: "", element: <WebHome /> }, // 前台首页
      { path: "article/:id", element: <ArticleDetail /> }, // 文章详情页
      { path: "archives", element: <WebArchives /> }, // 归档
      { path: "about", element: <WebAbout /> }, // 关于我们
    ],
  },
  {
    path: "/login", // 管理员登录页面
    element: <AdminLogin />,
  },
  {
    path: "/admin", // 后台管理根路由
    element: (
      <AuthGuard>
        <AdminIndex />
      </AuthGuard>
    ),
    children: [
      { path: "", element: <AdminHome /> }, // 后台首页
      { path: "articles", element: <AdminArticle /> }, // 文章管理
      { path: "comments", element: <AdminComment /> }, // 评论管理
      { path: "images", element: <AdminImage /> }, // 图片管理
      { path: "users", element: <AdminUser /> }, // 用户管理
      { path: "categories", element: <AdminCategory /> }, // 分类管理
      { path: "friendlinks", element: <AdminFriendlink /> }, // 友情链接管理
      { path: "settings", element: <AdminSetting /> }, // 系统设置
    ],
  },
  { path: "*", element: <NotFound /> }, // 404页面
];

// 创建路由实例，配置未来特性
export const router: any = createBrowserRouter(routerObj, {
  future: {
    v7_fetcherPersist: true, // 持久化 fetcher 数据
    v7_normalizeFormMethod: true, // 标准化表单方法
    v7_partialHydration: true, // 部分水合
    v7_relativeSplatPath: true, // 相对路径通配符
    v7_skipActionErrorRevalidation: true, // 跳过操作错误重新验证
  },
});
