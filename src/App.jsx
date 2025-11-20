import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import Orders from './pages/Orders';
import CreateOrder from './pages/CreateOrder';
import AdminDashboard from './pages/AdminDashboard';
import ManageProducts from './pages/ManageProducts';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/products" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/products" element={<Products />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/create-order" element={<CreateOrder />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/products" element={<ManageProducts />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
