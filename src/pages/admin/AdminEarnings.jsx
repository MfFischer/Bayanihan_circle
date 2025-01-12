import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { db } from '../../lib/supabase'
import { Wallet, TrendingUp, DollarSign, Download } from 'lucide-react'
import { format } from 'date-fns'

export default function AdminEarnings() {
  const { member, isAdmin } = useAuth()
  const [earnings, setEarnings] = useState([])
  const [wallet, setWallet] = useState(null)
  const [platformWallet, setPlatformWallet] = useState(null)
  const [allWallets, setAllWallets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isAdmin && member?.id) {
      loadData()
    }
  }, [isAdmin, member])

  const loadData = async () => {
    try {
      // Load admin's earnings
      const { data: earningsData } = await db.getAdminEarnings(member.id)

      // Load management fees (admin's commission)
      const { data: managementFees } = await db.supabase
        .from('management_fees')
        .select('*')
        .order('collected_at', { ascending: false })

      // Combine earnings and management fees
      const allEarnings = [
        ...(earningsData || []),
        ...(managementFees || []).map(fee => ({
          id: fee.id,
          admin_id: member.id,
          amount: fee.admin_share,
          earning_type: `management_${fee.fee_type}`,
          description: `${fee.fee_type} fee commission`,
          reference_type: fee.reference_type,
          reference_id: fee.reference_id,
          created_at: fee.collected_at
        }))
      ]

      setEarnings(allEarnings)

      // Load admin's wallet
      const { data: walletData } = await db.getWallet(member.id, 'admin')
      setWallet(walletData)

      // Load platform wallet (super admin only)
      if (member.admin_role === 'super_admin') {
        const { data: platformData } = await db.getPlatformWallet()
        setPlatformWallet(platformData)

        const { data: allWalletsData } = await db.getAllWallets()
        setAllWallets(allWalletsData || [])
      }
    } catch (error) {
      console.error('Error loading earnings data:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalEarnings = earnings.reduce((sum, e) => sum + parseFloat(e.amount), 0)
  const earningsByType = earnings.reduce((acc, e) => {
    acc[e.earning_type] = (acc[e.earning_type] || 0) + parseFloat(e.amount)
    return acc
  }, {})

  const exportEarnings = () => {
    const csv = [
      ['Date', 'Type', 'Amount', 'Description'],
      ...earnings.map(e => [
        format(new Date(e.created_at), 'yyyy-MM-dd HH:mm:ss'),
        e.earning_type,
        e.amount,
        e.description || ''
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `admin-earnings-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600">Only administrators can view earnings.</p>
      </div>
    )
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center space-x-3">
            <Wallet className="w-8 h-8 text-primary-600" />
            <span>Admin Earnings</span>
          </h1>
          <p className="text-gray-600 mt-1">Your earnings and wallet balance</p>
        </div>
        <button
          onClick={exportEarnings}
          className="btn-secondary flex items-center space-x-2"
        >
          <Download className="w-5 h-5" />
          <span>Export Report</span>
        </button>
      </div>

      {/* Wallet Balance */}
      <div className="card bg-gradient-to-r from-primary-500 to-primary-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-primary-100 mb-1">Your Wallet Balance</p>
            <h2 className="text-4xl font-bold">₱{(wallet?.balance || 0).toLocaleString()}</h2>
            <p className="text-primary-100 mt-2">Available for withdrawal</p>
          </div>
          <Wallet className="w-16 h-16 text-primary-200" />
        </div>
      </div>

      {/* Earnings Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-900">₱{totalEarnings.toLocaleString()}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Service Fees</p>
          <p className="text-2xl font-bold text-blue-600">
            ₱{(earningsByType.service_fee_share || 0).toLocaleString()}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Commissions</p>
          <p className="text-2xl font-bold text-purple-600">
            ₱{(earningsByType.commission || 0).toLocaleString()}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Total Transactions</p>
          <p className="text-2xl font-bold text-orange-600">{earnings.length}</p>
        </div>
      </div>

      {/* Platform Wallet (Super Admin Only) */}
      {member.admin_role === 'super_admin' && platformWallet && (
        <div className="card bg-gradient-to-r from-green-500 to-emerald-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 mb-1">Platform Wallet</p>
              <h2 className="text-4xl font-bold">₱{parseFloat(platformWallet.balance).toLocaleString()}</h2>
              <p className="text-green-100 mt-2">System revenue</p>
            </div>
            <DollarSign className="w-16 h-16 text-green-200" />
          </div>
        </div>
      )}

      {/* All Admin Wallets (Super Admin Only) */}
      {member.admin_role === 'super_admin' && allWallets.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">All Admin Wallets</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admin</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Updated</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allWallets.map((w) => (
                  <tr key={w.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {w.owner_type === 'platform' ? 'Platform' : w.members?.full_name || 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {w.members?.email || ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        w.owner_type === 'platform' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {w.owner_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      ₱{parseFloat(w.balance).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(w.last_updated), 'MMM dd, yyyy HH:mm')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Earnings History */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Earnings History</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {earnings.map((earning) => (
                <tr key={earning.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(new Date(earning.created_at), 'MMM dd, yyyy HH:mm')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {earning.earning_type.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                    +₱{parseFloat(earning.amount).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {earning.description || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {earnings.length === 0 && (
          <div className="text-center py-12">
            <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No earnings yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

