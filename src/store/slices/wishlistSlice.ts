import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit'
import { wishlistService } from '@/src/services/wishlist.service'
import type { WishlistProduct } from '@/src/types/wishlist'
import type { RootState } from '../store'

interface WishlistState {
  products: WishlistProduct[]
  pendingIds: string[]   // product IDs currently being toggled
  error: string | null
}

const initialState: WishlistState = {
  products: [],
  pendingIds: [],
  error: null,
}

export const fetchWishlistThunk = createAsyncThunk(
  'wishlist/fetch',
  async (_, { rejectWithValue }) => {
    try {
      return await wishlistService.getWishlist()
    } catch (err) {
      return rejectWithValue((err as Error).message)
    }
  }
)

export const addToWishlistThunk = createAsyncThunk(
  'wishlist/add',
  async (productId: string, { rejectWithValue }) => {
    try {
      return { ...(await wishlistService.addToWishlist(productId)), productId }
    } catch (err) {
      return rejectWithValue({ message: (err as Error).message, productId })
    }
  }
)

export const removeFromWishlistThunk = createAsyncThunk(
  'wishlist/remove',
  async (productId: string, { rejectWithValue }) => {
    try {
      return { ...(await wishlistService.removeFromWishlist(productId)), productId }
    } catch (err) {
      return rejectWithValue({ message: (err as Error).message, productId })
    }
  }
)

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ── Fetch ────────────────────────────────────────────────────────────────
      .addCase(fetchWishlistThunk.fulfilled, (state, action) => {
        state.products = action.payload.products
      })
      .addCase(fetchWishlistThunk.rejected, (state, action) => {
        state.error = action.payload as string
      })

      // ── Add ──────────────────────────────────────────────────────────────────
      .addCase(addToWishlistThunk.pending, (state, action) => {
        const productId = action.meta.arg
        if (!state.pendingIds.includes(productId)) state.pendingIds.push(productId)
        // Optimistic: add a placeholder so the heart fills immediately
        const alreadyIn = state.products.some((p) => p._id === productId)
        if (!alreadyIn) state.products.push({ _id: productId, name: '', price: 0, images: [] })
      })
      .addCase(addToWishlistThunk.fulfilled, (state, action) => {
        const { products, productId } = action.payload
        state.pendingIds = state.pendingIds.filter((id) => id !== productId)
        state.products = products
      })
      .addCase(addToWishlistThunk.rejected, (state, action) => {
        const { productId } = action.payload as { message: string; productId: string }
        state.pendingIds = state.pendingIds.filter((id) => id !== productId)
        // Rollback optimistic placeholder
        state.products = state.products.filter((p) => !(p._id === productId && p.name === ''))
        state.error = (action.payload as { message: string }).message
      })

      // ── Remove ───────────────────────────────────────────────────────────────
      .addCase(removeFromWishlistThunk.pending, (state, action) => {
        const productId = action.meta.arg
        if (!state.pendingIds.includes(productId)) state.pendingIds.push(productId)
        // Optimistic: remove immediately so the heart unfills instantly
        state.products = state.products.filter((p) => p._id !== productId)
      })
      .addCase(removeFromWishlistThunk.fulfilled, (state, action) => {
        const { products, productId } = action.payload
        state.pendingIds = state.pendingIds.filter((id) => id !== productId)
        state.products = products
      })
      .addCase(removeFromWishlistThunk.rejected, (state, action) => {
        const { productId } = action.payload as { message: string; productId: string }
        state.pendingIds = state.pendingIds.filter((id) => id !== productId)
        state.error = (action.payload as { message: string }).message
      })
  },
})

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectWishlist = (state: RootState) => state.wishlist

// Memoised — avoids creating a new array reference on every render
export const selectWishlistProductIds = createSelector(
  (state: RootState) => state.wishlist.products,
  (products) => products.map((p) => p._id)
)

export const selectIsInWishlist = (productId: string) => (state: RootState): boolean =>
  state.wishlist.products.some((p) => p._id === productId)

export const selectIsWishlistPending = (productId: string) => (state: RootState): boolean =>
  state.wishlist.pendingIds.includes(productId)

export default wishlistSlice.reducer
