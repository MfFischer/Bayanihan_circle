import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { useAuth } from './contexts/AuthContext'

// Pages
import Login from './pages/Login'
import Register from './pages/Register'
import AdminDashboard from './pages/AdminDashboard'
import Loans from './pages/Loans'
import Contributions from './pages/Contributions'
import Profile from './pages/Profile'
import FAQ from './pages/FAQ'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import Contact from './pages/Contact'
import NotFound from './pages/NotFound'

// Admin Pages
import SecurityLogs from './pages/admin/SecurityLogs'
import AdminEarnings from './pages/admin/AdminEarnings'
import GroupSettings from './pages/admin/GroupSettings'
import AddMember from './pages/admin/AddMember'
import MembershipFees from './pages/admin/MembershipFees'
import Members from './pages/admin/Members'
import MemberDetail from './pages/admin/MemberDetail'

// Layout
import Layout from './components/Layout'

// Protected Route Component
function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading, isAdmin } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />
  }
  
  return children
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="loans" element={<Loans />} />
            <Route path="contributions" element={<Contributions />} />
            <Route path="profile" element={<Profile />} />
            <Route path="faq" element={<FAQ />} />
            <Route path="privacy" element={<Privacy />} />
            <Route path="terms" element={<Terms />} />
            <Route path="contact" element={<Contact />} />

            {/* Admin Routes */}
            <Route path="admin/security-logs" element={
              <ProtectedRoute adminOnly>
                <SecurityLogs />
              </ProtectedRoute>
            } />
            <Route path="admin/earnings" element={
              <ProtectedRoute adminOnly>
                <AdminEarnings />
              </ProtectedRoute>
            } />
            <Route path="admin/settings" element={
              <ProtectedRoute adminOnly>
                <GroupSettings />
              </ProtectedRoute>
            } />
            <Route path="admin/add-member" element={
              <ProtectedRoute adminOnly>
                <AddMember />
              </ProtectedRoute>
            } />
            <Route path="admin/membership-fees" element={
              <ProtectedRoute adminOnly>
                <MembershipFees />
              </ProtectedRoute>
            } />
            <Route path="admin/members" element={
              <ProtectedRoute adminOnly>
                <Members />
              </ProtectedRoute>
            } />
            <Route path="admin/members/:memberId" element={
              <ProtectedRoute adminOnly>
                <MemberDetail />
              </ProtectedRoute>
            } />
          </Route>
          
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App

