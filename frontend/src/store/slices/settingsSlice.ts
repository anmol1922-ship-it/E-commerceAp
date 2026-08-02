import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "../../api/axios";

export interface AppSettings {
  gstRate: number;
  deliveryCharge: number;
  freeDeliveryThreshold: number;
  minimumOrderAmount: number;
  servicablePincodes: string[];
  deliverySlots: string[];
  businessName: string;
  supportPhone: string;
  supportEmail: string;
  businessHoursStart: string;
  businessHoursEnd: string;
  privacyPolicyUrl: string;
  termsUrl: string;
  aboutText: string;
  appVersion: string;
  maintenanceMode: boolean;
}

interface SettingsState {
  settings: AppSettings | null;
  loading: boolean;
  error: string | null;
}

const initialState: SettingsState = {
  settings: null,
  loading: false,
  error: null,
};

export const fetchSettings = createAsyncThunk(
  "settings/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/settings/public");
      return data.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to load settings",
      );
    }
  },
);

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchSettings.fulfilled,
        (state, action: PayloadAction<AppSettings>) => {
          state.loading = false;
          state.settings = action.payload;
        },
      )
      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default settingsSlice.reducer;
