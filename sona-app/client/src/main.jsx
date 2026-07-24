import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.jsx";
import Directory from "./pages/Directory.jsx";
import ArtistDetail from "./pages/ArtistDetail.jsx";
import "./index.css";
import MerchShop from "./pages/MerchShop.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<App />}>
          <Route path="/" element={<Directory />} />
          <Route path="/artists/:id" element={<ArtistDetail />} />
          <Route path="/merch" element={<MerchShop />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
