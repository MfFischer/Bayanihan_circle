import { useEffect, useState } from 'react'
import { db } from '../../lib/supabase'
import { DollarSign, CheckCircle, XCircle, Users, TrendingUp } from 'lucide-react'

export default function MembershipFees() {
  const [members, setMembers] = useState([])
  const [stats, setStats] = useState({
    totalMembers: 0,
    paidMembers: 0,
    unpaidMembers: 0,
    totalCollected: 0
  })
  const [loading, setLoading] = useState(true)
  const [collectingFor, setCollectingFor] = useState(null)
  const [feeAmount, setFeeAmount] = useState('500')
  const [paymentMethod, setPaymentMethod] = useState('cash')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Get all members
      const { data: membersData } = await db.getMembers()
      
      // Get membership fees
      const { data: feesData } = await db.supabase
        .from('membership_fees')
        .select('*')

      const paidMemberIds = new Set(feesData?.map(f => f.member_id) || [])
      
      const membersWithStatus = membersData?.map(m => ({
        ...m,
        fee_paid: paidMemberIds.has(m.id) || m.membership_fee_paid,
        fee_amount: m.membership_fee_amount || 0
      })) || []

      setMembers(membersWithStatus)

      // Calculate stats
      const paid = membersWithStatus.filter(m => m.fee_paid)
      const totalCollected = feesData?.reduce((sum, f) => sum + parseFloat(f.amount), 0) || 0

      setStats({
        totalMembers: membersWithStatus.length,
        paidMembers: paid.length,
        unpaidMembers: membersWithStatus.length - paid.length,
        totalCollected
      })
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCollectFee = async (memberId) => {
    try {
      const { data, error } = await db.supabase.rpc('collect_membership_fee', {
        p_member_id: memberId,
        p_amount: parseFloat(feeAmount),
        p_payment_method: paymentMethod
      })

      if (error) {
        console.error('Error collecting fee:', error)
        alert('Error collecting fee: ' + error.message)
        return
      }

      alert(`Membership fee collected!\nAdmin earned: ₱${feeAmount}`)
      setCollectingFor(null)
      loadData()
    } catch (error) {
      console.error('Error:', error)
      alert('Error collecting fee: ' + error.message)
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
        <h1 className="text-3xl font-bold">Membership Fees</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Members</p>
              <p className="text-3xl font-bold">{stats.totalMembers}</p>
            </div>
            <Users className="w-12 h-12 text-gray-400" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Paid</p>
              <p className="text-3xl font-bold text-green-600">{stats.paidMembers}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Unpaid</p>
              <p className="text-3xl font-bold text-red-600">{stats.unpaidMembers}</p>
            </div>
            <XCircle className="w-12 h-12 text-red-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Collected</p>
              <p className="text-3xl font-bold text-primary-600">₱{stats.totalCollected.toLocaleString()}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-primary-600" />
          </div>
        </div>
      </div>

      {/* Members List */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Members</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Amount</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">{member.full_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{member.email}</td>
                  <td className="px-4 py-3 text-sm">
                    {member.fee_paid ? (
                      <span className="inline-flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        <CheckCircle className="w-3 h-3" />
                        <span>Paid</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                        <XCircle className="w-3 h-3" />
                        <span>Unpaid</span>
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {member.fee_paid ? `₱${member.fee_amount.toLocaleString()}` : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {!member.fee_paid && (
                      <button
                        onClick={() => setCollectingFor(member.id)}
                        className="btn-primary text-xs"
                      >
                        Collect Fee
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Collect Fee Modal */}
      {collectingFor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Collect Membership Fee</h3>
            
            <div className="space-y-4">
              <div>
                <label className="label">Amount (₱)</label>
                <input
                  type="number"
                  value={feeAmount}
                  onChange={(e) => setFeeAmount(e.target.value)}
                  className="input-field"
                  min="0"
                  step="50"
                />
              </div>

              <div>
                <label className="label">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="input-field"
                >
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="gcash">GCash</option>
                  <option value="paymaya">PayMaya</option>
                </select>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
                <p><strong>Fee Breakdown:</strong></p>
                <p>Total: ₱{parseFloat(feeAmount).toLocaleString()}</p>
                <p><strong>Admin (100%): ₱{parseFloat(feeAmount).toLocaleString()}</strong></p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => handleCollectFee(collectingFor)}
                  className="btn-primary flex-1"
                >
                  Collect Fee
                </button>
                <button
                  onClick={() => setCollectingFor(null)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

