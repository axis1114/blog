﻿import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { userInfoType } from "@/api/user";
import { decryptData, encryptData } from "@/utils/crypto";

interface State {
    user: {
        isLogin: boolean;
        userInfo: userInfoType | null;
    };
    isInitialized: boolean;
}

const initialState: State = {
    user: {
        isLogin: false,
        userInfo: null,
    },
    isInitialized: false,
};

const slice = createSlice({
    name: "web",
    initialState,
    reducers: {
        // 登录
        login: (state, action: PayloadAction<any>) => {
            state.user.isLogin = true;
            state.user.userInfo = action.payload;
            localStorage.setItem("userInfo", encryptData(state.user));
        },
        // 注销
        logout: (state) => {
            state.user.isLogin = false;
            state.user.userInfo = null;
            localStorage.removeItem("userInfo");
        },
        // 初始化用户状态和主题
        initializeFromStorage: (state) => {
            // 初始化用户信息
            const storedData = localStorage.getItem("userInfo");
            if (storedData) {
                const decryptedData = decryptData(storedData);
                state.user = decryptedData;
            }
            state.isInitialized = true;
        },
        // 更新 token
        updateToken: (state, action: PayloadAction<string>) => {
            if (state.user.userInfo) {
                state.user.userInfo.token = action.payload;
                localStorage.setItem("userInfo", encryptData(state.user));
            }
        },
        // 更新用户信息
        updateUserInfo: (state, action: PayloadAction<userInfoType>) => {
            state.user.userInfo = action.payload;
            localStorage.setItem("userInfo", encryptData(state.user));
        },
    },
});

export const {
    login,
    logout,
    initializeFromStorage,
    updateUserInfo,
    updateToken,
} = slice.actions;

export default slice.reducer;
