import { Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { ProductListPage } from "./pages/ProductListPage";
import { ProductCreatePage } from "./pages/ProductCreatePage";
import { ProductEditPage } from "./pages/ProductEditPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/products" replace />} />
        <Route path="/products" element={<ProductListPage />} />
        <Route path="/products/new" element={<ProductCreatePage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/products/:id/edit" element={<ProductEditPage />} />
      </Route>
    </Routes>
  );
}
