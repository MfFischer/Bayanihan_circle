import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { User, Mail, Phone, Shield, Award, TrendingUp, DollarSign } from 'lucide-react'
import { db } from '../lib/supabase'

export default function Profile() {
  const { member, user } = useAuth()
  const [editing, setEditing] = useState(false)
  const [interestTracking, setInterestTracking] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentYear] = useState(new Date().getFullYear())

  useEffect(() => {
    if (member?.id) {
      loadDividendInfo()
    }
  }, [member])

  const loadDividendInfo = async () => {
    try {
      const { data } = await db.getMemberInterestTracking(member.id)
      setInterestTracking(data || [])
    } catch (error) {
      console.error('Error loading dividend info:', error)
    } finally {
      setLoading(false)
    }
  }

  const currentYearData = interestTracking.find(t => t.year === currentYear)
  const totalInterestPaid = currentYearData?.total_interest_paid || 0
  const quotaMet = currentYearData?.quota_met || false
  const dividendAmount = currentYearData?.dividend_amount || 0

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">My Profile</h1>

      <div className="card">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-cooperative-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-3xl">
              {member?.full_name?.charAt(0) || 'U'}
            </span>
          </div>
          <div>
            <h2 className="text-2xl font-bold">{member?.full_name}</h2>
            <p className="text-gray-600">{member?.role === 'admin' ? 'Administrator' : 'Member'}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Mail className="w-5 h-5 text-gray-600" />
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{member?.email || user?.email}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Phone className="w-5 h-5 text-gray-600" />
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="font-medium">{member?.phone || 'Not provided'}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Shield className="w-5 h-5 text-gray-600" />
            <div>
              <p className="text-sm text-gray-600">Role</p>
              <p className="font-medium capitalize">{member?.role || 'Member'}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <User className="w-5 h-5 text-gray-600" />
            <div>
              <p className="text-sm text-gray-600">Member Since</p>
              <p className="font-medium">
                {member?.created_at ? new Date(member.created_at).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <button className="btn-primary">Edit Profile</button>
        </div>
      </div>

      {/* Dividend Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-r from-cooperative-500 to-purple-600 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-purple-100">Interest Paid ({currentYear})</span>
            <DollarSign className="w-6 h-6 text-purple-200" />
          </div>
          <div className="text-4xl font-bold">₱{totalInterestPaid.toLocaleString()}</div>
          <p className="text-purple-100 mt-2 text-sm">Loan interest paid this year</p>
        </div>

        <div className={`card ${quotaMet ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200' : 'bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className={quotaMet ? 'text-green-700' : 'text-yellow-700'}>Quota Status</span>
            <Award className={`w-6 h-6 ${quotaMet ? 'text-green-600' : 'text-yellow-600'}`} />
          </div>
          <div className={`text-3xl font-bold ${quotaMet ? 'text-green-600' : 'text-yellow-600'}`}>
            {quotaMet ? '✓ Met' : '✗ Not Met'}
          </div>
          <p className={`mt-2 text-sm ${quotaMet ? 'text-green-600' : 'text-yellow-600'}`}>
            {quotaMet ? 'Eligible for full dividend' : 'Need more interest to qualify'}
          </p>
        </div>

        <div className="card bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-700">Dividend Earned</span>
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-blue-600">₱{dividendAmount.toLocaleString()}</div>
          <p className="text-blue-600 mt-2 text-sm">Year-end distribution amount</p>
        </div>
      </div>

      {/* Interest History */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Interest Tracking History</h2>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : interestTracking.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No interest tracking data yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {interestTracking.map((tracking) => (
              <div key={tracking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Year {tracking.year}</p>
                  <p className="text-sm text-gray-500">
                    {tracking.quota_met ? '✓ Quota Met' : '✗ Quota Not Met'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-600">₱{tracking.total_interest_paid.toLocaleString()}</p>
                  <p className="text-sm text-green-600">Dividend: ₱{tracking.dividend_amount.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

