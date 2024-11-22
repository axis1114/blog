import { configureStore } from "@reduxjs/toolkit";
import reducer from "./slice";

const store = configureStore({
  reducer: {
    web: reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // 关闭序列化检查
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
