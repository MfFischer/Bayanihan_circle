import { useEffect, useState } from 'react'
import { db } from '../../lib/supabase'
import { DollarSign, TrendingUp, Users, CheckCircle, AlertCircle } from 'lucide-react'

export default function YearEndDistribution() {
  const [year, setYear] = useState(new Date().getFullYear())
  const [distribution, setDistribution] = useState(null)
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(false)
  const [calculating, setCalculating] = useState(false)
  const [distributing, setDistributing] = useState(false)
  const [quotaSettings, setQuotaSettings] = useState({
    required_loan_interest_quota: 5000,
    withdrawal_waiting_period_days: 30
  })

  useEffect(() => {
    loadDistributionData()
    loadQuotaSettings()
  }, [year])

  const loadQuotaSettings = async () => {
    try {
      const { data } = await db.getQuotaSettings()
      if (data) {
        const settings = {}
        data.forEach(s => {
          settings[s.key] = s.value
        })
        setQuotaSettings(settings)
      }
    } catch (error) {
      console.error('Error loading quota settings:', error)
    }
  }

  const loadDistributionData = async () => {
    setLoading(true)
    try {
      // Get existing distribution
      const { data: distData } = await db.getYearEndDistribution(year)
      setDistribution(distData)

      // Get interest tracking for the year
      const { data: interestData } = await db.getInterestTrackingByYear(year)
      
      // Get all members with their contributions
      const { data: membersData } = await db.getMembers()
      
      if (membersData && interestData) {
        const enrichedMembers = membersData.map(member => {
          const interest = interestData.find(i => i.member_id === member.id)
          return {
            ...member,
            total_interest_paid: interest?.total_interest_paid || 0,
            quota_met: interest?.quota_met || false,
            dividend_amount: interest?.dividend_amount || 0
          }
        })
        setMembers(enrichedMembers)
      }
    } catch (error) {
      console.error('Error loading distribution data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCalculateDistribution = async () => {
    if (!confirm(`Calculate year-end distribution for ${year}?`)) return

    setCalculating(true)
    try {
      const { data, error } = await db.calculateYearEndDistribution(year)
      
      if (error) throw error

      // Create distribution record
      const quotaMembers = members.filter(m => m.quota_met).length
      const totalInterest = members.reduce((sum, m) => sum + (m.total_interest_paid || 0), 0)
      const fullDividend = quotaMembers > 0 ? totalInterest / quotaMembers : 0

      const { data: newDist, error: distError } = await db.createYearEndDistribution({
        year,
        total_interest_earned: totalInterest,
        quota_members_count: quotaMembers,
        full_dividend_amount: fullDividend,
        total_distributed: 0,
        status: 'pending'
      })

      if (distError) throw distError

      setDistribution(newDist)
      alert('Distribution calculated successfully!')
      loadDistributionData()
    } catch (error) {
      console.error('Error calculating distribution:', error)
      alert('Error: ' + error.message)
    } finally {
      setCalculating(false)
    }
  }

  const handleDistributeNow = async () => {
    if (!distribution) {
      alert('Please calculate distribution first')
      return
    }

    if (!confirm(`Distribute ₱${distribution.total_distributed.toLocaleString()} to ${members.length} members?`)) return

    setDistributing(true)
    try {
      // Update distribution status
      const { error } = await db.updateYearEndDistribution(distribution.id, {
        status: 'distributed',
        distributed_at: new Date().toISOString()
      })

      if (error) throw error

      // Create transactions for each member
      for (const member of members) {
        if (member.dividend_amount > 0) {
          await db.supabase
            .from('transactions')
            .insert({
              member_id: member.id,
              transaction_type: 'dividend',
              amount: member.dividend_amount,
              transaction_date: new Date().toISOString().split('T')[0],
              description: `Year-end dividend for ${year}`
            })
        }
      }

      alert('Distribution completed successfully!')
      loadDistributionData()
    } catch (error) {
      console.error('Error distributing:', error)
      alert('Error: ' + error.message)
    } finally {
      setDistributing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const quotaMembers = members.filter(m => m.quota_met).length
  const totalInterest = members.reduce((sum, m) => sum + (m.total_interest_paid || 0), 0)
  const fullDividend = quotaMembers > 0 ? totalInterest / quotaMembers : 0

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <TrendingUp className="w-8 h-8 text-primary-600" />
          <h1 className="text-3xl font-bold">Year-End Distribution</h1>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="input-field"
          >
            {[new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-sm text-gray-600">Total Interest Earned</p>
          <p className="text-2xl font-bold text-blue-600">₱{totalInterest.toLocaleString()}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Quota Members</p>
          <p className="text-2xl font-bold text-green-600">{quotaMembers}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Full Dividend/Member</p>
          <p className="text-2xl font-bold text-purple-600">₱{fullDividend.toLocaleString()}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Status</p>
          <p className="text-2xl font-bold text-gray-900">{distribution?.status || 'Not Calculated'}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button
          onClick={handleCalculateDistribution}
          disabled={calculating || distribution?.status === 'distributed'}
          className="btn-primary flex items-center space-x-2"
        >
          <CheckCircle className="w-5 h-5" />
          <span>{calculating ? 'Calculating...' : 'Calculate Distribution'}</span>
        </button>
        <button
          onClick={handleDistributeNow}
          disabled={distributing || !distribution || distribution.status === 'distributed'}
          className="btn-secondary flex items-center space-x-2"
        >
          <DollarSign className="w-5 h-5" />
          <span>{distributing ? 'Distributing...' : 'Distribute Now'}</span>
        </button>
      </div>

      {/* Members Distribution Table */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Member Distribution Details</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-2 text-left">Member</th>
                <th className="px-4 py-2 text-right">Interest Paid</th>
                <th className="px-4 py-2 text-center">Quota Met</th>
                <th className="px-4 py-2 text-right">Dividend</th>
                <th className="px-4 py-2 text-right">Total Payout</th>
              </tr>
            </thead>
            <tbody>
              {members.map(member => {
                const dividend = member.quota_met 
                  ? fullDividend 
                  : (member.total_interest_paid / quotaSettings.required_loan_interest_quota) * fullDividend
                const totalPayout = (member.share_capital || 0) + dividend

                return (
                  <tr key={member.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{member.full_name}</td>
                    <td className="px-4 py-2 text-right">₱{member.total_interest_paid.toLocaleString()}</td>
                    <td className="px-4 py-2 text-center">
                      {member.quota_met ? (
                        <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-yellow-600 mx-auto" />
                      )}
                    </td>
                    <td className="px-4 py-2 text-right font-semibold">₱{dividend.toLocaleString()}</td>
                    <td className="px-4 py-2 text-right font-bold text-green-600">₱{totalPayout.toLocaleString()}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

