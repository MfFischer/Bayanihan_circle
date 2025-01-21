import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LogIn, Mail, Lock, AlertCircle, Users, TrendingUp, Shield, Heart, DollarSign, CheckCircle } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error } = await signIn(email, password)
      if (error) throw error
      navigate('/dashboard')
    } catch (error) {
      setError(error.message || 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Marketing/Landing */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-cooperative-600 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center space-x-3 mb-12">
            <img
              src="/images/Bayanihankoop logo.png"
              alt="Bayanihan Koop Logo"
              className="h-16 w-16 object-contain bg-white rounded-xl p-2"
            />
            <div>
              <h1 className="text-2xl font-bold text-white">Bayanihan Circle</h1>
              <p className="text-primary-100 text-sm">Cooperative Savings & Loans</p>
            </div>
          </div>

          {/* Main Headline */}
          <div className="mb-12">
            <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
              Build Your Financial Future Together
            </h2>
            <p className="text-xl text-primary-100 leading-relaxed">
              Join a trusted community where members save together, support each other, and grow financially through cooperative lending.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Community-Driven</h3>
                <p className="text-primary-100">Pool resources with trusted members for mutual financial growth</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Earn Dividends</h3>
                <p className="text-primary-100">Get year-end dividends based on your participation and loan interest paid</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Secure & Transparent</h3>
                <p className="text-primary-100">Track contributions, loans, and payments with complete transparency</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Bayanihan Spirit</h3>
                <p className="text-primary-100">Experience the Filipino tradition of helping one another succeed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="relative z-10 grid grid-cols-3 gap-6 pt-8 border-t border-white/20">
          <div>
            <div className="text-3xl font-bold text-white mb-1">₱12K</div>
            <div className="text-primary-100 text-sm">Annual Contribution</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white mb-1">42%</div>
            <div className="text-primary-100 text-sm">Avg. Return Rate</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white mb-1">100%</div>
            <div className="text-primary-100 text-sm">Admin Earnings</div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="max-w-md w-full">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <img
              src="/images/Bayanihankoop logo.png"
              alt="Bayanihan Koop Logo"
              className="h-16 w-16 object-contain mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-gray-900">Bayanihan Circle</h1>
            <p className="text-gray-600 text-sm">Cooperative Savings & Loans</p>
          </div>

          {/* Login Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-600">
              Sign in to manage your cooperative account
            </p>
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">
                <Mail className="w-4 h-4 inline mr-2" />
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="label">
                <Lock className="w-4 h-4 inline mr-2" />
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-gray-600">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-primary-600 hover:text-primary-700">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold">
              Register here
            </Link>
          </div>
        </div>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>New to Bayanihan Circle?</strong> This is a business cooperative where your money works through active lending and borrowing. Join us to maximize your returns!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

