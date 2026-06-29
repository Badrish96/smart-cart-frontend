import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { cartService } from '@/src/services/cart.service'
import { productService } from '@/src/services/product.service'
import type { Cart, CartItem } from '@/src/types/cart'
import type { RootState } from '../store'

/** Populate string productIds with full product data so images and names render. */
async function enrichItems(items: CartItem[]): Promise<CartItem[]> {
  const toFetch = items
    .filter((item) => typeof item.productId === 'string')
    .map((item) => item.productId as string)

  if (toFetch.length === 0) return items

  const products = await Promise.allSettled(toFetch.map((id) => productService.getProduct(id)))
  const map: Record<string, (typeof products)[0] extends PromiseFulfilledResult<infer T> ? T : never> = {}
  products.forEach((r, i) => {
    if (r.status === 'fulfilled') map[toFetch[i]] = r.value
  })

  return items.map((item) =>
    typeof item.productId === 'string' && map[item.productId]
      ? { ...item, productId: map[item.productId] }
      : item
  )
}

async function enrichCart(cart: Cart): Promise<Cart> {
  return { ...cart, items: await enrichItems(cart.items) }
}

interface CartState {
  cart: Cart | null
  pendingItemIds: string[]   // productIds currently being added/removed
  isLoading: boolean
  error: string | null
}

const initialState: CartState = {
  cart: null,
  pendingItemIds: [],
  isLoading: false,
  error: null,
}

export const fetchCartThunk = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try { return await enrichCart(await cartService.getCart()) }
  catch (err) { return rejectWithValue((err as Error).message) }
})

export const addToCartThunk = createAsyncThunk(
  'cart/addItem',
  async ({ productId, quantity = 1 }: { productId: string; quantity?: number }, { rejectWithValue }) => {
    try { return { cart: await enrichCart(await cartService.addItem(productId, quantity)), productId } }
    catch (err) { return rejectWithValue({ message: (err as Error).message, productId }) }
  }
)

export const updateCartItemThunk = createAsyncThunk(
  'cart/updateItem',
  async ({ itemId, quantity }: { itemId: string; quantity: number }, { rejectWithValue }) => {
    try { return await enrichCart(await cartService.updateItem(itemId, quantity)) }
    catch (err) { return rejectWithValue((err as Error).message) }
  }
)

export const removeCartItemThunk = createAsyncThunk(
  'cart/removeItem',
  async (itemId: string, { rejectWithValue }) => {
    try { return await enrichCart(await cartService.removeItem(itemId)) }
    catch (err) { return rejectWithValue((err as Error).message) }
  }
)

export const clearCartThunk = createAsyncThunk('cart/clear', async (_, { rejectWithValue }) => {
  try { await cartService.clearCart(); return null }
  catch (err) { return rejectWithValue((err as Error).message) }
})

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    resetCart: (state) => { state.cart = null },
  },
  extraReducers: (builder) => {
    // fetch
    builder
      .addCase(fetchCartThunk.pending, (state) => { state.isLoading = true })
      .addCase(fetchCartThunk.fulfilled, (state, action) => {
        state.isLoading = false
        state.cart = action.payload
      })
      .addCase(fetchCartThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // add
    builder
      .addCase(addToCartThunk.pending, (state, action) => {
        if (!state.pendingItemIds.includes(action.meta.arg.productId))
          state.pendingItemIds.push(action.meta.arg.productId)
      })
      .addCase(addToCartThunk.fulfilled, (state, action) => {
        state.cart = action.payload.cart
        state.pendingItemIds = state.pendingItemIds.filter((id) => id !== action.payload.productId)
      })
      .addCase(addToCartThunk.rejected, (state, action) => {
        const { productId } = action.payload as { message: string; productId: string }
        state.pendingItemIds = state.pendingItemIds.filter((id) => id !== productId)
        state.error = (action.payload as { message: string }).message
      })

    // update
    builder
      .addCase(updateCartItemThunk.fulfilled, (state, action) => { state.cart = action.payload })

    // remove
    builder
      .addCase(removeCartItemThunk.fulfilled, (state, action) => { state.cart = action.payload })

    // clear
    builder
      .addCase(clearCartThunk.fulfilled, (state) => { state.cart = null })
  },
})

export const { resetCart } = cartSlice.actions
export default cartSlice.reducer

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectCart = (state: RootState) => state.cart.cart
export const selectCartLoading = (state: RootState) => state.cart.isLoading
export const selectCartPendingIds = (state: RootState) => state.cart.pendingItemIds

export const selectCartCount = (state: RootState): number =>
  state.cart.cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0

export const selectIsCartPending = (productId: string) => (state: RootState): boolean =>
  state.cart.pendingItemIds.includes(productId)
