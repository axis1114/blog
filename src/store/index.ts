// 从 Redux Toolkit 中导入配置 store 的工具函数
import { configureStore } from "@reduxjs/toolkit";
// 导入根 reducer
import reducer from "./slice";

// 创建 Redux store
const store = configureStore({
  // 配置 reducer
  reducer: {
    web: reducer, // 将名为 'web' 的 reducer 添加到 store 中
  },
  // 配置中间件
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // 关闭序列化检查，允许在 state 中存储非序列化值
    }),
});

// 从 store 中导出 RootState 类型，用于 TypeScript 类型检查
export type RootState = ReturnType<typeof store.getState>;
// 从 store 中导出 Dispatch 类型，用于 TypeScript 类型检查
export type AppDispatch = typeof store.dispatch;

// 导出配置好的 store
export default store;
