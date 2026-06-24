import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import toastReducer from './slices/toastSlice'
import productReducer from './slices/productSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    toast: toastReducer,
    products: productReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
