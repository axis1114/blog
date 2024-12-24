import { RouterProvider } from "react-router-dom";
import { router } from "./router/index";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { initializeFromStorage } from "./store/slice";
import { Spin } from "antd";
import { RootState } from "./store/index";

export const App = () => {
  const isInitialized = useSelector(
    (state: RootState) => state.web.isInitialized
  );
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(initializeFromStorage());
  }, [dispatch]);

  if (!isInitialized) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 z-50">
        <Spin size="large" className="scale-150" />
      </div>
    );
  }

  return (
    <div className="app">
      <RouterProvider future={{ v7_startTransition: true }} router={router} />
    </div>
  );
};
