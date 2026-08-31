import { Navigate, Route, Routes } from 'react-router-dom'
import AdminDashboardPage from './pages/AdminDashboardPage'
import BrowseListingsPage from './pages/BrowseListingsPage'
import CheckoutPage from './pages/CheckoutPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import MessagesPage from './pages/MessagesPage'
import PostItemPage from './pages/PostItemPage'
import ProductDetailPage from './pages/ProductDetailPage'
import RegisterPage from './pages/RegisterPage'
import SellerDashboardPage from './pages/SellerDashboardPage'
import ProtectedRoute from './components/ProtectedRoute'
import PaymentCallbackPage from './pages/PaymentCallbackPage'
import AccountPage from './pages/AccountPage'
import FloatingChat from './components/FloatingChat'

export default function App() {
  return (
    <>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/listings" element={<BrowseListingsPage />} />
      <Route path="/listings/:listingId" element={<ProductDetailPage />} />
      <Route path="/checkout/:listingId" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
      <Route path="/checkout" element={<Navigate to="/listings" replace />} />
      <Route path="/payment/callback" element={<ProtectedRoute><PaymentCallbackPage /></ProtectedRoute>} />
      <Route path="/post-item" element={<ProtectedRoute><PostItemPage /></ProtectedRoute>} />
      <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
      <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
      <Route path="/seller" element={<ProtectedRoute><Navigate to="/account" replace /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboardPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    <FloatingChat />
    </>
  )
}
