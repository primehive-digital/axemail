import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type UiState = {
  selectedMailerType: string | null;
};

const initialState: UiState = {
  selectedMailerType: null,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setSelectedMailerType(state, action: PayloadAction<string | null>) {
      state.selectedMailerType = action.payload;
    },
  },
});

export const { setSelectedMailerType } = uiSlice.actions;
export const uiReducer = uiSlice.reducer;
