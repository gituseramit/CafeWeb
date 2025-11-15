import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Services from './pages/Services'
import SubmitJob from './pages/SubmitJob'
import OrderStatus from './pages/OrderStatus'
import Payment from './pages/Payment'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminDashboard from './pages/admin/Dashboard'
import AdminServices from './pages/admin/Services'
import AdminOrders from './pages/admin/Orders'
import AdminReports from './pages/admin/Reports'
import AdminSettings from './pages/admin/Settings'

function AppRoutes() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/submit-job" element={<SubmitJob />} />
        <Route path="/order/:ticketNumber" element={<OrderStatus />} />
        <Route path="/payment/:orderId" element={<Payment />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Admin routes */}
        <Route 
          path="/admin" 
          element={user?.role === 'admin' || user?.role === 'cashier' ? <AdminDashboard /> : <Navigate to="/" />} 
        />
        <Route 
          path="/admin/services" 
          element={user?.role === 'admin' ? <AdminServices /> : <Navigate to="/" />} 
        />
        <Route 
          path="/admin/orders" 
          element={user?.role === 'admin' || user?.role === 'cashier' ? <AdminOrders /> : <Navigate to="/" />} 
        />
        <Route 
          path="/admin/reports" 
          element={user?.role === 'admin' || user?.role === 'cashier' ? <AdminReports /> : <Navigate to="/" />} 
        />
        <Route 
          path="/admin/settings" 
          element={user?.role === 'admin' ? <AdminSettings /> : <Navigate to="/" />} 
        />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App

