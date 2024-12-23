import { RootState } from "@/store";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

/**
 * AuthGuard 组件 - 用于保护需要登录才能访问的路由
 *
 * 功能说明：
 * 1. 检查用户是否已登录
 * 2. 如果用户未登录且尝试访问 /admin 开头的路由，则重定向到登录页面
 * 3. 如果用户已登录或访问的不是受保护路由，则正常显示子组件
 *
 * @param {Object} props - 组件属性
 * @param {React.ReactNode} props.children - 子组件
 * @returns {JSX.Element} 返回子组件或重定向组件
 */
export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  // 获取当前路由信息
  const location = useLocation();

  // 从 Redux store 中获取用户登录状态
  const isLoggedIn = useSelector((state: RootState) => state.web.user.isLogin);

  // 使用 useMemo 缓存渲染结果，避免不必要的重渲染
  const redirectComponent = useMemo(() => {
    // 如果用户未登录且尝试访问 /admin 路径
    if (!isLoggedIn && location.pathname.startsWith("/admin")) {
      // 重定向到登录页面，并保存原始访问路径
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
    // 正常情况下渲染子组件
    return <>{children}</>;
  }, [isLoggedIn, location, children]);

  return redirectComponent;
};
