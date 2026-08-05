import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.jsx";
import Login from "./pages/Login.jsx";
import Onboarding from "./pages/Onboarding.jsx";
import Directory from "./pages/Directory.jsx";
import ArtistDetail from "./pages/ArtistDetail.jsx";
import Profile from "./pages/Profile.jsx";
import Concerts from "./pages/Concerts.jsx";
import Feed from "./pages/Feed.jsx";
import MerchShop from "./pages/MerchShop.jsx";
import Cart from "./pages/Cart.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<App />}>
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/" element={<Directory />} />
          <Route path="/artists/:id" element={<ArtistDetail />} />
          <Route path="/concerts" element={<Concerts />} />
          <Route path="/merch" element={<MerchShop />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/cart" element={<Cart />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
