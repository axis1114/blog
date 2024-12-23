import { userInfoType } from "@/api/user";
import { decryptData, encryptData } from "@/utils/crypto";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// 定义状态接口
interface State {
    user: {
        isLogin: boolean;        // 用户登录状态
        userInfo: userInfoType | null;  // 用户信息，可以为 null
    };
    isInitialized: boolean;      // 应用程序是否已初始化
}

// 初始状态
const initialState: State = {
    user: {
        isLogin: false,          // 默认未登录
        userInfo: null,          // 默认无用户信息
    },
    isInitialized: false,        // 默认未初始化
};

// 创建 Redux slice
const slice = createSlice({
    name: "web",                 // slice 名称
    initialState,
    reducers: {
        // 处理用户登录
        // @param action.payload - 用户信息对象
        login: (state, action: PayloadAction<any>) => {
            state.user.isLogin = true;
            state.user.userInfo = action.payload;
            // 将用户信息加密后存储到 localStorage
            localStorage.setItem("userInfo", encryptData(state.user));
        },

        // 处理用户注销
        logout: (state) => {
            state.user.isLogin = false;
            state.user.userInfo = null;
            // 清除本地存储的用户信息
            localStorage.removeItem("userInfo");
        },

        // 从本地存储初始化用户状态
        initializeFromStorage: (state) => {
            // 获取并解密本地存储的用户信息
            const storedData = localStorage.getItem("userInfo");
            if (storedData) {
                const decryptedData = decryptData(storedData);
                state.user = decryptedData;
            }
            state.isInitialized = true;
        },

        // 更新用户 token
        // @param action.payload - 新的 token 字符串
        updateToken: (state, action: PayloadAction<string>) => {
            if (state.user.userInfo) {
                state.user.userInfo.token = action.payload;
                // 更新后的信息重新加密存储
                localStorage.setItem("userInfo", encryptData(state.user));
            }
        },

        // 更新用户信息
        // @param action.payload - 新的用户信息对象
        updateUserInfo: (state, action: PayloadAction<userInfoType>) => {
            state.user.userInfo = action.payload;
            // 更新后的信息重新加密存储
            localStorage.setItem("userInfo", encryptData(state.user));
        },
    },
});

// 导出 action creators
export const {
    login,
    logout,
    initializeFromStorage,
    updateUserInfo,
    updateToken,
} = slice.actions;

// 导出 reducer
export default slice.reducer;
