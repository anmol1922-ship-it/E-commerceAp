import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { store } from "./store";
import { fetchSettings } from "./store/slices/settingsSlice";
import App from "./App";
import "./index.css";

// Load app settings on startup
store.dispatch(fetchSettings());

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Toaster position="top-right" />
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);
