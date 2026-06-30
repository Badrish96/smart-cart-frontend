import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { productService } from "@/src/services/product.service";
import { addToast } from "./toastSlice";
import type { Product, ProductFilters, ProductsResponse } from "@/src/types/product";
import type { RootState } from "../store";

interface ProductState {
  products: Product[];
  total: number;
  isLoading: boolean;
  isAdding: boolean;
  isDeleting: boolean;
  isUpdating: boolean;
  updatingId: string | null;
  deletingId: string | null;
  error: string | null;
  addSuccess: boolean;
  updateSuccess: boolean;
}

const initialState: ProductState = {
  products: [],
  total: 0,
  isLoading: false,
  isAdding: false,
  isDeleting: false,
  isUpdating: false,
  updatingId: null,
  deletingId: null,
  error: null,
  addSuccess: false,
  updateSuccess: false,
};

export const fetchProductsThunk = createAsyncThunk(
  "products/fetchAll",
  async (filters: ProductFilters, { rejectWithValue }) => {
    try {
      return await productService.getProducts(filters);
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message);
    }
  },
);

export const addProductThunk = createAsyncThunk(
  "products/add",
  async (formData: FormData, { rejectWithValue, dispatch }) => {
    try {
      const product = await productService.addProduct(formData);

      dispatch(
        addToast({
          type: "success",
          title: "Product added!",
          message: `"${product.name}" is now live in the store.`,
        }),
      );

      return product;
    } catch (err: unknown) {
      const message = (err as Error).message;

      dispatch(
        addToast({
          type: "error",
          title: "Failed to add product",
          message,
        }),
      );

      return rejectWithValue(message);
    }
  },
);

export const updateProductThunk = createAsyncThunk(
  "products/update",
  async (
    { id, formData }: { id: string; formData: FormData },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const product = await productService.updateProduct(id, formData);
      dispatch(
        addToast({
          type: "success",
          title: "Product updated!",
          message: `"${product.name}" has been updated.`,
        })
      );
      return product;
    } catch (err: unknown) {
      const message = (err as Error).message;
      dispatch(
        addToast({ type: "error", title: "Failed to update product", message })
      );
      return rejectWithValue(message);
    }
  }
);

export const deleteProductThunk = createAsyncThunk(
  "products/delete",
  async (productId: string, { rejectWithValue, dispatch }) => {
    try {
      await productService.deleteProduct(productId);

      dispatch(
        addToast({
          type: "success",
          title: "Product deleted",
          message: "The product has been removed from the store.",
        }),
      );

      return productId;
    } catch (err: unknown) {
      const message = (err as Error).message;

      dispatch(
        addToast({
          type: "error",
          title: "Failed to delete product",
          message,
        }),
      );

      return rejectWithValue(message);
    }
  },
);

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    clearAddSuccess(state) {
      state.addSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProductsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = (action.payload as ProductsResponse).products;
        state.total = (action.payload as ProductsResponse).total;
      })
      .addCase(fetchProductsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Add Product
      .addCase(addProductThunk.pending, (state) => {
        state.isAdding = true;
        state.error = null;
        state.addSuccess = false;
      })
      .addCase(addProductThunk.fulfilled, (state, action) => {
        state.isAdding = false;
        state.addSuccess = true;
        state.products.unshift(action.payload as Product);
        state.total += 1;
      })
      .addCase(addProductThunk.rejected, (state, action) => {
        state.isAdding = false;
        state.error = action.payload as string;
      })

      // Update Product
      .addCase(updateProductThunk.pending, (state, action) => {
        state.isUpdating = true;
        state.updatingId = action.meta.arg.id;
        state.updateSuccess = false;
        state.error = null;
      })
      .addCase(updateProductThunk.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.updatingId = null;
        state.updateSuccess = true;
        const updated = action.payload as Product;
        const idx = state.products.findIndex((p) => p._id === updated._id);
        if (idx !== -1) state.products[idx] = updated;
      })
      .addCase(updateProductThunk.rejected, (state, action) => {
        state.isUpdating = false;
        state.updatingId = null;
        state.error = action.payload as string;
      })

      // Delete Product
      .addCase(deleteProductThunk.pending, (state, action) => {
        state.isDeleting = true;
        state.deletingId = action.meta.arg;
        state.error = null;
      })
      .addCase(deleteProductThunk.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.deletingId = null;
        const deletedId = action.payload as string;
        state.products = state.products.filter((p) => p._id !== deletedId);
        state.total = Math.max(0, state.total - 1);
      })
      .addCase(deleteProductThunk.rejected, (state, action) => {
        state.isDeleting = false;
        state.deletingId = null;
        state.error = action.payload as string;
      });
  },
});

export const { clearAddSuccess } = productSlice.actions;

export default productSlice.reducer;

// Selectors
export const selectProducts = (state: RootState) =>
  state.products.products;

export const selectProductsLoading = (state: RootState) =>
  state.products.isLoading;

export const selectProductsAdding = (state: RootState) =>
  state.products.isAdding;

export const selectProductDeleting   = (state: RootState) => state.products.isDeleting;
export const selectDeletingId        = (state: RootState) => state.products.deletingId;
export const selectProductUpdating   = (state: RootState) => state.products.isUpdating;
export const selectUpdatingId        = (state: RootState) => state.products.updatingId;
export const selectProductAddSuccess  = (state: RootState) => state.products.addSuccess;
export const selectProductUpdateSuccess = (state: RootState) => state.products.updateSuccess;
export const selectProductsError     = (state: RootState) => state.products.error;
export const selectProductsTotal     = (state: RootState) => state.products.total;