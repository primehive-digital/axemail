import { combineReducers } from "@reduxjs/toolkit";

import { authReducer } from "@/store/slices/auth-slice";
import { uiReducer } from "@/store/slices/ui-slice";

export const rootReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
});
