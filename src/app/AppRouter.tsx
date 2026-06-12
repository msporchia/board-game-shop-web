import { BrowserRouter, Route, Routes } from 'react-router';
import { HomePage } from '../home/HomePage.tsx';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}
