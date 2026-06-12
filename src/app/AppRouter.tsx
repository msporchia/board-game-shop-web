import { BrowserRouter, Route, Routes } from 'react-router';
import { AppLayout } from './AppLayout.tsx';
import { CatalogPage } from '../catalog/CatalogPage.tsx';
import { ProductDetailPage } from '../catalog/ProductDetailPage.tsx';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/games/:id" element={<ProductDetailPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
