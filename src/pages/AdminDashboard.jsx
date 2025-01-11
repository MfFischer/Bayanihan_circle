import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../lib/supabase'
import {
  Users,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
  Shield
} from 'lucide-react'
import { Link } from 'react-router-dom'

export default function AdminDashboard() {
  const { member } = useAuth()
  const [stats, setStats] = useState({
    totalMembers: 0,
    pendingLoans: 0,
    activeLoans: 0,
    totalCollected: 0,
    totalActiveLoanAmount: 0,
    activeFunds: 0,
    availableForNewLoans: 0,
    scheduledLoans: 0,
    totalMembershipFees: 0,
    totalManagementFees: 0,
    totalEarnings: 0
  })
  const [pendingLoans, setPendingLoans] = useState([])
  const [pendingContributions, setPendingContributions] = useState([])
  const [scheduledLoans, setScheduledLoans] = useState([])
  const [loading, setLoading] = useState(true)
  const [showRecordContribution, setShowRecordContribution] = useState(false)
  const [showLoansModal, setShowLoansModal] = useState(false)
  const [showRecordPayment, setShowRecordPayment] = useState(false)
  const [showScheduleLoan, setShowScheduleLoan] = useState(false)
  const [members, setMembers] = useState([])
  const [recordForm, setRecordForm] = useState({
    memberId: '',
    amount: '',
    paymentMethod: 'cash',
    notes: ''
  })
  const [paymentForm, setPaymentForm] = useState({
    memberId: '',
    amount: '',
    paymentMethod: 'cash',
    paymentDate: new Date().toISOString().split('T')[0],
    notes: ''
  })
  const [loanForm, setLoanForm] = useState({
    memberId: '',
    amount: '',
    purpose: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    termMonths: 12,
    interestRate: 2.0
  })
  const [groupSettings, setGroupSettings] = useState({
    loan_term_months: 12,
    interest_rate_per_month: 2.0
  })

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Activate scheduled loans that are due
      await db.supabase.rpc('activate_scheduled_loans')

      // Get group settings for loan defaults
      const { data: groupSettingsData } = await db.supabase
        .from('group_settings')
        .select('loan_term_months, interest_rate_per_month')
        .eq('group_id', member?.group_id)
        .single()

      if (groupSettingsData) {
        setGroupSettings({
          loan_term_months: groupSettingsData.loan_term_months || 12,
          interest_rate_per_month: groupSettingsData.interest_rate_per_month || 2.0
        })
        // Update loanForm with default values from settings
        setLoanForm(prev => ({
          ...prev,
          termMonths: groupSettingsData.loan_term_months || 12,
          interestRate: groupSettingsData.interest_rate_per_month || 2.0
        }))
      }

      // Get all members
      const { data: membersData } = await db.getMembers()
      setMembers(membersData || [])

      // Get all loans
      const { data: loans } = await db.getLoans()

      // Get active funds data
      const { data: activeFundsData } = await db.supabase
        .from('v_active_funds')
        .select('*')
        .single()

      // Get admin earnings
      const { data: earningsData } = await db.supabase
        .rpc('get_admin_earnings', { p_group_id: member?.group_id })

      // Calculate stats
      const pendingLoansData = loans?.filter(l => l.status === 'pending' || l.status === 'scheduled') || []
      const activeLoansData = loans?.filter(l => l.status === 'active') || []
      const scheduledLoansData = loans?.filter(l => l.status === 'scheduled') || []

      setStats({
        totalMembers: membersData?.length || 0,
        pendingLoans: pendingLoansData.length,
        activeLoans: activeLoansData.length,
        totalCollected: activeFundsData?.total_collected || 0,
        totalActiveLoanAmount: activeFundsData?.total_active_loans || 0,
        activeFunds: activeFundsData?.active_funds || 0,
        availableForNewLoans: activeFundsData?.available_for_new_loans || 0,
        scheduledLoans: scheduledLoansData.length,
        totalMembershipFees: earningsData?.[0]?.total_membership_fees || 0,
        totalManagementFees: earningsData?.[0]?.total_management_fees || 0,
        totalEarnings: earningsData?.[0]?.total_earnings || 0
      })

      setPendingLoans(pendingLoansData.slice(0, 5))
      setScheduledLoans(scheduledLoansData.slice(0, 5))
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const approveLoan = async (loanId) => {
    try {
      await db.updateLoan(loanId, {
        status: 'active',
        approved_by: member.id,
        approved_at: new Date().toISOString(),
        disbursed_at: new Date().toISOString()
      })
      alert('Loan approved successfully! Member earned +100 points')
      loadDashboardData()
    } catch (error) {
      console.error('Error approving loan:', error)
      alert('Error approving loan: ' + error.message)
    }
  }

  const rejectLoan = async (loanId) => {
    if (!confirm('Are you sure you want to reject this loan?')) return

    try {
      await db.updateLoan(loanId, {
        status: 'rejected',
        approved_by: member.id,
        approved_at: new Date().toISOString()
      })
      alert('Loan rejected')
      loadDashboardData()
    } catch (error) {
      console.error('Error rejecting loan:', error)
      alert('Error rejecting loan: ' + error.message)
    }
  }

  const handleRecordContribution = async (e) => {
    e.preventDefault()

    if (!recordForm.memberId || !recordForm.amount) {
      alert('Please fill in all required fields')
      return
    }

    try {
      const { error } = await db.supabase
        .from('contributions')
        .insert({
          member_id: recordForm.memberId,
          group_id: member?.group_id,
          amount: parseFloat(recordForm.amount),
          status: 'approved',
          contribution_date: new Date().toISOString().split('T')[0],
          payment_method: recordForm.paymentMethod,
          notes: recordForm.notes,
          approved_at: new Date().toISOString(),
          approved_by: member?.id
        })

      if (error) {
        console.error('Error recording contribution:', error)
        alert('Error recording contribution: ' + error.message)
        return
      }

      alert('Contribution recorded successfully!')
      setRecordForm({ memberId: '', amount: '', paymentMethod: 'cash', notes: '' })
      setShowRecordContribution(false)
      loadDashboardData()
    } catch (error) {
      console.error('Error recording contribution:', error)
      alert('Error recording contribution: ' + error.message)
    }
  }

  const handleRecordPayment = async (e) => {
    e.preventDefault()

    if (!paymentForm.memberId || !paymentForm.amount) {
      alert('Please fill in all required fields')
      return
    }

    try {
      // Get the member's active loans
      const { data: loans } = await db.supabase
        .from('loans')
        .select('*')
        .eq('member_id', paymentForm.memberId)
        .eq('status', 'active')
        .order('created_at', { ascending: true })

      if (!loans || loans.length === 0) {
        alert('This member has no active loans')
        return
      }

      // Record payment for the first active loan
      // Trigger will automatically award points if applicable
      const { error: paymentError } = await db.supabase
        .from('loan_payments')
        .insert({
          loan_id: loans[0].id,
          amount: parseFloat(paymentForm.amount),
          payment_method: paymentForm.paymentMethod,
          payment_date: paymentForm.paymentDate,
          notes: paymentForm.notes || null
        })

      if (paymentError) throw paymentError

      alert('Payment recorded successfully!')
      setPaymentForm({ memberId: '', amount: '', paymentMethod: 'cash', paymentDate: new Date().toISOString().split('T')[0], notes: '' })
      setShowRecordPayment(false)
      loadDashboardData()
    } catch (error) {
      console.error('Error recording payment:', error)
      alert('Error recording payment: ' + error.message)
    }
  }

  const handleScheduleLoan = async (e) => {
    e.preventDefault()

    if (!loanForm.memberId || !loanForm.amount || !loanForm.purpose) {
      alert('Please fill in all required fields')
      return
    }

    try {
      const { error } = await db.supabase
        .from('loans')
        .insert({
          member_id: loanForm.memberId,
          group_id: member?.group_id,
          amount: parseFloat(loanForm.amount),
          purpose: loanForm.purpose,
          status: 'scheduled',
          scheduled_date: loanForm.scheduledDate,
          term_months: loanForm.termMonths,
          interest_rate: loanForm.interestRate
        })

      if (error) throw error

      alert('Loan scheduled successfully!')
      setLoanForm({
        memberId: '',
        amount: '',
        purpose: '',
        scheduledDate: new Date().toISOString().split('T')[0],
        termMonths: groupSettings.loan_term_months || 12,
        interestRate: groupSettings.interest_rate_per_month || 2.0
      })
      setShowScheduleLoan(false)
      loadDashboardData()
    } catch (error) {
      console.error('Error scheduling loan:', error)
      alert('Error scheduling loan: ' + error.message)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex items-center space-x-3">
          <Link
            to="/admin/members"
            className="btn-primary flex items-center space-x-2"
          >
            <Users className="w-5 h-5" />
            <span>View All Members</span>
          </Link>
          <Link
            to="/admin/add-member"
            className="btn-secondary flex items-center space-x-2"
          >
            <Users className="w-5 h-5" />
            <span>Add Member</span>
          </Link>
          <button
            onClick={() => setShowRecordContribution(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <CreditCard className="w-5 h-5" />
            <span>Record Contribution</span>
          </button>
          <button
            onClick={() => setShowLoansModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <TrendingUp className="w-5 h-5" />
            <span>Loans</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Members</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalMembers}</p>
            </div>
            <Users className="w-12 h-12 text-primary-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Loans</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.pendingLoans}</p>
            </div>
            <Clock className="w-12 h-12 text-yellow-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Collected</p>
              <p className="text-3xl font-bold text-blue-600">₱{stats.totalCollected.toLocaleString()}</p>
            </div>
            <CreditCard className="w-12 h-12 text-blue-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Loans</p>
              <p className="text-3xl font-bold text-green-600">{stats.activeLoans}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-green-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Loans Out</p>
              <p className="text-3xl font-bold text-purple-600">₱{stats.totalActiveLoanAmount.toLocaleString()}</p>
            </div>
            <DollarSign className="w-12 h-12 text-purple-600" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-semibold">Active Funds (Available)</p>
              <p className="text-3xl font-bold text-green-600">₱{stats.activeFunds.toLocaleString()}</p>
              <p className="text-xs text-green-600 mt-1">Can release: ₱{stats.availableForNewLoans.toLocaleString()}</p>
            </div>
            <DollarSign className="w-12 h-12 text-green-600" />
          </div>
        </div>
      </div>




      {/* Pending Loans */}
      {pendingLoans.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Pending Loan Applications (Scheduled + Pending)</h2>
          <div className="space-y-3">
            {pendingLoans.map((loan) => (
              <div key={loan.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">₱{parseFloat(loan.amount).toLocaleString()}</h3>
                    <p className="text-sm text-gray-600">{loan.purpose}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>Term: {loan.term_months} months</span>
                      <span>Rate: {loan.interest_rate}%</span>
                      <span>Applied: {new Date(loan.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => approveLoan(loan.id)}
                      className="btn-primary flex items-center space-x-1 text-sm"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => rejectLoan(loan.id)}
                      className="btn-secondary flex items-center space-x-1 text-sm"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}



      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/admin/add-member" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-4">
            <Users className="w-12 h-12 text-blue-600" />
            <div>
              <h3 className="font-bold text-lg">Add Member</h3>
              <p className="text-sm text-gray-600">Create new member account</p>
            </div>
          </div>
        </Link>

        <Link to="/admin/membership-fees" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-4">
            <DollarSign className="w-12 h-12 text-orange-600" />
            <div>
              <h3 className="font-bold text-lg">Membership Fees</h3>
              <p className="text-sm text-gray-600">Collect & track fees</p>
            </div>
          </div>
        </Link>

        <Link to="/admin/settings" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-4">
            <Shield className="w-12 h-12 text-purple-600" />
            <div>
              <h3 className="font-bold text-lg">Group Settings</h3>
              <p className="text-sm text-gray-600">Configure fees & points</p>
            </div>
          </div>
        </Link>

        <Link to="/admin/security-logs" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-4">
            <Shield className="w-12 h-12 text-primary-600" />
            <div>
              <h3 className="font-bold text-lg">Security Logs</h3>
              <p className="text-sm text-gray-600">View all system activities</p>
            </div>
          </div>
        </Link>

        <Link to="/admin/earnings" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-4">
            <DollarSign className="w-12 h-12 text-green-600" />
            <div>
              <h3 className="font-bold text-lg">My Earnings</h3>
              <p className="text-sm text-gray-600">
                Membership: ₱{stats.totalMembershipFees.toLocaleString()} | Management: ₱{stats.totalManagementFees.toLocaleString()} | Total: ₱{stats.totalEarnings.toLocaleString()}
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Record Contribution Modal */}
      {showRecordContribution && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Record Contribution</h2>

              <form onSubmit={handleRecordContribution} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Member *
                  </label>
                  <select
                    value={recordForm.memberId}
                    onChange={(e) => setRecordForm({ ...recordForm, memberId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="">Select a member</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.full_name} ({m.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount (₱) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={recordForm.amount}
                    onChange={(e) => setRecordForm({ ...recordForm, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={recordForm.paymentMethod}
                    onChange={(e) => setRecordForm({ ...recordForm, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="cash">Cash</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="gcash">GCash</option>
                    <option value="check">Check</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={recordForm.notes}
                    onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Optional notes"
                    rows="3"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowRecordContribution(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Record Contribution
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Loans Modal */}
      {showLoansModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="text-2xl font-bold">Loans Management</h2>
              <div className="flex space-x-3 mt-4">
                <button
                  onClick={() => setShowRecordPayment(true)}
                  className="btn-primary flex-1 text-sm"
                >
                  Record Payment
                </button>
                <button
                  onClick={() => setShowScheduleLoan(true)}
                  className="btn-primary flex-1 text-sm"
                >
                  Schedule Loan
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Scheduled Loans */}
              <div>
                <h3 className="text-lg font-bold mb-3 text-purple-600">Scheduled Loans ({scheduledLoans.length})</h3>
                {scheduledLoans.length === 0 ? (
                  <p className="text-gray-500">No scheduled loans</p>
                ) : (
                  <div className="space-y-2">
                    {scheduledLoans.map((loan) => (
                      <div key={loan.id} className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">{loan.member_name}</p>
                            <p className="text-sm text-gray-600">₱{loan.amount.toLocaleString()} - {loan.purpose}</p>
                            <p className="text-xs text-gray-500">Scheduled: {new Date(loan.scheduled_date).toLocaleDateString()}</p>
                          </div>
                          <Link to={`/admin/members/${loan.member_id}`} className="btn-primary text-xs px-3 py-1">
                            Schedule Loan
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pending Loans */}
              <div>
                <h3 className="text-lg font-bold mb-3 text-yellow-600">Pending Loans ({pendingLoans.length})</h3>
                {pendingLoans.length === 0 ? (
                  <p className="text-gray-500">No pending loans</p>
                ) : (
                  <div className="space-y-2">
                    {pendingLoans.map((loan) => (
                      <div key={loan.id} className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">{loan.member_name}</p>
                            <p className="text-sm text-gray-600">₱{loan.amount.toLocaleString()} - {loan.purpose}</p>
                            <p className="text-xs text-gray-500">Balance: ₱{(loan.balance || 0).toLocaleString()}</p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                approveLoan(loan.id)
                                setShowLoansModal(false)
                              }}
                              className="btn-primary text-xs px-3 py-1 bg-green-600 hover:bg-green-700"
                            >
                              Approve
                            </button>
                            <Link to={`/admin/members/${loan.member_id}`} className="btn-primary text-xs px-3 py-1">
                              Pay
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button
                onClick={() => setShowLoansModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showRecordPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Record Loan Payment</h3>
            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Member *</label>
                <select
                  value={paymentForm.memberId}
                  onChange={(e) => setPaymentForm({...paymentForm, memberId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="">Select a member</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.full_name} ({m.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Amount (₱) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Payment Method</label>
                <select value={paymentForm.paymentMethod} onChange={(e) => setPaymentForm({...paymentForm, paymentMethod: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="gcash">GCash</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Payment Date</label>
                <input type="date" required value={paymentForm.paymentDate} onChange={(e) => setPaymentForm({...paymentForm, paymentDate: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes (optional)</label>
                <textarea value={paymentForm.notes} onChange={(e) => setPaymentForm({...paymentForm, notes: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" rows="2"></textarea>
              </div>
              <div className="flex space-x-3">
                <button type="button" onClick={() => setShowRecordPayment(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Record Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Loan Modal */}
      {showScheduleLoan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Schedule Loan</h3>
            <form onSubmit={handleScheduleLoan} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Member *</label>
                <select
                  value={loanForm.memberId}
                  onChange={(e) => setLoanForm({...loanForm, memberId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="">Select a member</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.full_name} ({m.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Amount (₱) *</label>
                <input type="number" step="0.01" min="0" required value={loanForm.amount} onChange={(e) => setLoanForm({...loanForm, amount: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Purpose *</label>
                <input type="text" required value={loanForm.purpose} onChange={(e) => setLoanForm({...loanForm, purpose: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="e.g., Business, Education" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Scheduled Date</label>
                <input type="date" required value={loanForm.scheduledDate} onChange={(e) => setLoanForm({...loanForm, scheduledDate: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Term (months)</label>
                <input type="number" min="1" max="36" value={loanForm.termMonths} onChange={(e) => setLoanForm({...loanForm, termMonths: parseInt(e.target.value) || 12})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Interest Rate (%/month)</label>
                <input type="number" min="0" max="10" step="0.1" value={loanForm.interestRate} onChange={(e) => setLoanForm({...loanForm, interestRate: parseFloat(e.target.value) || 2.0})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div className="flex space-x-3">
                <button type="button" onClick={() => setShowScheduleLoan(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Schedule Loan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

