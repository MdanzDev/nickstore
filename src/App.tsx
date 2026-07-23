import { Routes, Route } from 'react-router'
import MainLayout from './components/MainLayout'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import TransactionCheck from './pages/TransactionCheck'
import Leaderboard from './pages/Leaderboard'
import Articles from './pages/Articles'
import Deposit from './pages/Deposit'
import UserDashboard from './pages/dashboard/UserDashboard'
import UserTransactions from './pages/dashboard/UserTransactions'
import UserMutasi from './pages/dashboard/UserMutasi'
import UserReports from './pages/dashboard/UserReports'
import UserSettings from './pages/dashboard/UserSettings'
import UserApi from './pages/dashboard/UserApi'

import AdminOverview from './pages/admin/AdminOverview'
import AdminOrders from './pages/admin/AdminOrders'
import AdminTransactions from './pages/admin/AdminTransactions'
import AdminApiManagement from './pages/admin/AdminApiManagement'
import AdminUsers from './pages/admin/AdminUsers'
import AdminProductDenominations from './pages/admin/AdminProductDenominations'
import AdminProducts from './pages/admin/AdminProducts'
import AdminGames from './pages/admin/AdminGames'
import AdminVouchers from './pages/admin/AdminVouchers'
import AdminAnnouncements from './pages/admin/AdminAnnouncements'
import AdminSettings from './pages/admin/AdminSettings'
import OrderStatus from './pages/OrderStatus'
import InvoiceDetail from './pages/InvoiceDetail'
import NotFound from './pages/NotFound'
import Pricelist from './pages/Pricelist'
import ResetPassword from './pages/ResetPassword'
import ApiDocs from './pages/ApiDocs'

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/daftar-harga" element={<Pricelist />} />
        <Route path="/cek-transaksi" element={<TransactionCheck />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/artikel" element={<Articles />} />
        <Route path="/docs" element={<ApiDocs />} />
        <Route path="/deposit" element={<Deposit />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/dashboard/transactions" element={<UserTransactions />} />
        <Route path="/dashboard/mutasi" element={<UserMutasi />} />
        <Route path="/dashboard/reports" element={<UserReports />} />
        <Route path="/dashboard/settings" element={<UserSettings />} />
        <Route path="/dashboard/api" element={<UserApi />} />

        <Route path="/admin" element={<AdminOverview />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/transactions" element={<AdminTransactions />} />
        <Route path="/admin/api-management" element={<AdminApiManagement />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        {/* FIXED: Changed from /admin/denominations to /admin/products/:id/denominations */}
        <Route path="/admin/products/:id/denominations" element={<AdminProductDenominations />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/admin/games" element={<AdminGames />} />
        <Route path="/admin/vouchers" element={<AdminVouchers />} />
        <Route path="/admin/announcements" element={<AdminAnnouncements />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/order/:id" element={<OrderStatus />} />
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}