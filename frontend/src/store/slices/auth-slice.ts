import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { AuthUser } from "@/lib/auth/types";

type AuthState = {
  user: AuthUser | null;
  isHydrated: boolean;
};

const initialState: AuthState = {
  user: null,
  isHydrated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCurrentUser(state, action: PayloadAction<AuthUser | null>) {
      state.user = action.payload;
      state.isHydrated = true;
    },
    clearCredentials(state) {
      state.user = null;
      state.isHydrated = true;
    },
  },
});

export const { clearCredentials, setCurrentUser } = authSlice.actions;
export const authReducer = authSlice.reducer;