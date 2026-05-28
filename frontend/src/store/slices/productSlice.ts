import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "../../api/axios";

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  mrp: number;
  category: string;
  size: string;
  bottlesPerCase: number;
  imageUrl: string;
  stock: number;
  isAvailable: boolean;
  popularity: number;
}

interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
  pagination: { page: number; pages: number; total: number };
}

const initialState: ProductState = {
  products: [],
  loading: false,
  error: null,
  pagination: { page: 1, pages: 1, total: 0 },
};

export const fetchProducts = createAsyncThunk(
  "products/fetch",
  async (params: Record<string, string> = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams(params).toString();
      const { data } = await api.get(`/products?${query}`);
      return data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to load products",
      );
    }
  },
);

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.products = action.payload.products;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default productSlice.reducer;
