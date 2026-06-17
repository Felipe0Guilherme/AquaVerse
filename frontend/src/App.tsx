// src/App.tsx
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AquariumScene from './pages/AquariumScene';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Roteamento simples — apenas 3 páginas
const router = createBrowserRouter([
  {
    path: '/',
    element: <AquariumScene />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
