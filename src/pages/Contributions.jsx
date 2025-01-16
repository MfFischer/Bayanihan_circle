import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../lib/supabase'
import { CreditCard, Plus, CheckCircle, Clock } from 'lucide-react'

export default function Contributions() {
  const { member } = useAuth()
  const [contributions, setContributions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNewForm, setShowNewForm] = useState(false)
  const [newContribution, setNewContribution] = useState({
    amount: '1000',
    payment_method: 'cash'
  })

  useEffect(() => {
    if (member?.id) {
      loadContributions()
    }
  }, [member])

  const loadContributions = async () => {
    if (!member?.id) return

    try {
      const { data } = await db.getContributions(member.id)
      setContributions(data || [])
    } catch (error) {
      console.error('Error loading contributions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!member?.id) {
      alert('Error: Member data not loaded. Please refresh the page.')
      return
    }

    try {
      await db.addContribution({
        member_id: member.id,
        amount: parseFloat(newContribution.amount),
        payment_method: newContribution.payment_method,
        contribution_date: new Date().toISOString(),
        status: 'pending'
      })
      setShowNewForm(false)
      setNewContribution({ amount: '1000', payment_method: 'cash' })
      loadContributions()
      alert('Contribution recorded successfully!')
    } catch (error) {
      console.error('Error recording contribution:', error)
      alert('Error recording contribution: ' + error.message)
    }
  }

  const totalContributions = contributions.reduce((sum, c) => sum + c.amount, 0)

  if (loading) {
    return <div className="flex justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Contributions</h1>
        <button
          onClick={() => setShowNewForm(!showNewForm)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Contribution</span>
        </button>
      </div>

      {/* Summary Card */}
      <div className="card bg-gradient-to-r from-green-500 to-emerald-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 mb-1">Total Contributions</p>
            <h2 className="text-4xl font-bold">₱{totalContributions.toLocaleString()}</h2>
            <p className="text-green-100 mt-2">{contributions.length} payments made</p>
          </div>
          <CreditCard className="w-16 h-16 text-green-200" />
        </div>
      </div>

      {/* New Contribution Form */}
      {showNewForm && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Record New Contribution</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Amount (₱)</label>
              <input
                type="number"
                value={newContribution.amount}
                onChange={(e) => setNewContribution({ ...newContribution, amount: e.target.value })}
                className="input-field"
                placeholder="1000"
                required
                min="100"
              />
              <p className="text-sm text-gray-500 mt-1">
                Standard monthly contribution: ₱1,000
              </p>
            </div>

            <div>
              <label className="label">Payment Method</label>
              <select
                value={newContribution.payment_method}
                onChange={(e) => setNewContribution({ ...newContribution, payment_method: e.target.value })}
                className="input-field"
              >
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="gcash">GCash</option>
                <option value="paymaya">PayMaya</option>
              </select>
            </div>

            <div className="flex space-x-3">
              <button type="submit" className="btn-primary">
                Record Contribution
              </button>
              <button
                type="button"
                onClick={() => setShowNewForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Contributions List */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Contribution History</h2>
        {contributions.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No contributions yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Method</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {contributions.map((contribution) => (
                  <tr key={contribution.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      {new Date(contribution.contribution_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold">
                      ₱{contribution.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm capitalize">
                      {contribution.payment_method.replace('_', ' ')}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                        contribution.status === 'confirmed' || contribution.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {contribution.status === 'confirmed' || contribution.status === 'approved' ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        <span className="capitalize">{contribution.status}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

