import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useMemo } from 'react';

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
    const location = useLocation();
    const isLoggedIn = useSelector((state: RootState) => state.web.user.isLogin);

    const redirectComponent = useMemo(() => {
        if (!isLoggedIn && location.pathname.startsWith('/admin')) {
            return <Navigate to="/login" state={{ from: location }} replace />;
        }
        return <>{children}</>;
    }, [isLoggedIn, location, children]);

    return redirectComponent;
};
