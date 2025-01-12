import { useEffect, useState } from 'react'
import { db } from '../../lib/supabase'
import { LogOut, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'

export default function WithdrawalRequests() {
  const [withdrawals, setWithdrawals] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    loadWithdrawals()
  }, [filter])

  const loadWithdrawals = async () => {
    setLoading(true)
    try {
      const { data, error } = await db.getWithdrawalRequests(null, filter)
      if (error) throw error
      setWithdrawals(data || [])
    } catch (error) {
      console.error('Error loading withdrawals:', error)
      alert('Error loading withdrawals: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (withdrawal) => {
    if (!confirm(`Approve withdrawal of ₱${withdrawal.withdrawal_amount.toLocaleString()} for ${withdrawal.members?.full_name}?`)) return

    setProcessing(true)
    try {
      const { error } = await db.approveWithdrawal(withdrawal.id)
      if (error) throw error

      alert('Withdrawal approved!')
      loadWithdrawals()
    } catch (error) {
      console.error('Error approving withdrawal:', error)
      alert('Error: ' + error.message)
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!selectedWithdrawal) return
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection')
      return
    }

    setProcessing(true)
    try {
      const { error } = await db.rejectWithdrawal(selectedWithdrawal.id, rejectReason)
      if (error) throw error

      alert('Withdrawal rejected!')
      setShowModal(false)
      setRejectReason('')
      loadWithdrawals()
    } catch (error) {
      console.error('Error rejecting withdrawal:', error)
      alert('Error: ' + error.message)
    } finally {
      setProcessing(false)
    }
  }

  const handleComplete = async (withdrawal) => {
    if (!confirm(`Mark withdrawal as completed for ${withdrawal.members?.full_name}?`)) return

    setProcessing(true)
    try {
      const { error } = await db.completeWithdrawal(withdrawal.id)
      if (error) throw error

      alert('Withdrawal completed!')
      loadWithdrawals()
    } catch (error) {
      console.error('Error completing withdrawal:', error)
      alert('Error: ' + error.message)
    } finally {
      setProcessing(false)
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    }
    return badges[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Clock className="w-4 h-4" />,
      approved: <CheckCircle className="w-4 h-4" />,
      completed: <CheckCircle className="w-4 h-4" />,
      rejected: <XCircle className="w-4 h-4" />,
      cancelled: <AlertCircle className="w-4 h-4" />
    }
    return icons[status]
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <LogOut className="w-8 h-8 text-primary-600" />
          <h1 className="text-3xl font-bold">Withdrawal Requests</h1>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 border-b">
        {['pending', 'approved', 'completed', 'rejected'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              filter === status
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Withdrawals Table */}
      <div className="card">
        {withdrawals.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No {filter} withdrawal requests</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-2 text-left">Member</th>
                  <th className="px-4 py-2 text-right">Amount</th>
                  <th className="px-4 py-2 text-left">Requested</th>
                  <th className="px-4 py-2 text-left">Eligible</th>
                  <th className="px-4 py-2 text-center">Status</th>
                  <th className="px-4 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map(withdrawal => (
                  <tr key={withdrawal.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium">{withdrawal.members?.full_name}</td>
                    <td className="px-4 py-2 text-right font-semibold">₱{withdrawal.withdrawal_amount.toLocaleString()}</td>
                    <td className="px-4 py-2 text-sm">
                      {new Date(withdrawal.requested_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {new Date(withdrawal.eligible_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(withdrawal.status)}`}>
                        {getStatusIcon(withdrawal.status)}
                        <span>{withdrawal.status}</span>
                      </span>
                    </td>
                    <td className="px-4 py-2 text-center">
                      {withdrawal.status === 'pending' && (
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => handleApprove(withdrawal)}
                            disabled={processing}
                            className="text-green-600 hover:text-green-800 font-medium text-xs"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              setSelectedWithdrawal(withdrawal)
                              setShowModal(true)
                            }}
                            disabled={processing}
                            className="text-red-600 hover:text-red-800 font-medium text-xs"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {withdrawal.status === 'approved' && (
                        <button
                          onClick={() => handleComplete(withdrawal)}
                          disabled={processing}
                          className="text-blue-600 hover:text-blue-800 font-medium text-xs"
                        >
                          Mark Complete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Rejection Modal */}
      {showModal && selectedWithdrawal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Reject Withdrawal</h2>
            <p className="text-gray-600 mb-4">
              Rejecting withdrawal of ₱{selectedWithdrawal.withdrawal_amount.toLocaleString()} for {selectedWithdrawal.members?.full_name}
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection..."
              className="input-field mb-4 h-24"
            />
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowModal(false)
                  setRejectReason('')
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={processing}
                className="btn-primary flex-1"
              >
                {processing ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

