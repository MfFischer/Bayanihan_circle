import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { db } from '../../lib/supabase'
import { ArrowLeft, User, DollarSign, CreditCard, Plus, Clock } from 'lucide-react'
import { format } from 'date-fns'

export default function MemberDetail() {
  const { memberId } = useParams()
  const [member, setMember] = useState(null)
  const [contributions, setContributions] = useState([])
  const [loans, setLoans] = useState([])
  const [loanPayments, setLoanPayments] = useState({}) // Store payments by loan_id
  const [loading, setLoading] = useState(true)
  const [showAddContribution, setShowAddContribution] = useState(false)
  const [showScheduleLoan, setShowScheduleLoan] = useState(false)
  const [showMakePayment, setShowMakePayment] = useState(false)
  const [selectedLoanId, setSelectedLoanId] = useState(null)
  const [expandedLoanId, setExpandedLoanId] = useState(null) // Track which loan's payment history is expanded

  const [contributionForm, setContributionForm] = useState({
    amount: '',
    payment_method: 'cash',
    contribution_date: new Date().toISOString().split('T')[0],
    notes: ''
  })

  const [loanForm, setLoanForm] = useState({
    amount: '',
    purpose: '',
    scheduled_date: new Date().toISOString().split('T')[0],
    term_months: 12,
    interest_rate: 2.0
  })
  const [groupSettings, setGroupSettings] = useState({
    loan_term_months: 12,
    interest_rate_per_month: 2.0
  })

  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    payment_method: 'cash',
    payment_date: new Date().toISOString().split('T')[0],
    notes: ''
  })

  useEffect(() => {
    loadMemberData()
  }, [memberId])

  const loadMemberData = async () => {
    try {
      const { data: memberData } = await db.supabase
        .from('v_members_with_capital')
        .select('*')
        .eq('id', memberId)
        .single()
      setMember(memberData)

      // Load group settings for loan defaults
      if (memberData?.group_id) {
        const { data: groupSettingsData } = await db.supabase
          .from('group_settings')
          .select('loan_term_months, interest_rate_per_month')
          .eq('group_id', memberData.group_id)
          .single()

        if (groupSettingsData) {
          setGroupSettings({
            loan_term_months: groupSettingsData.loan_term_months || 12,
            interest_rate_per_month: groupSettingsData.interest_rate_per_month || 2.0
          })
          // Update loanForm with default values from settings
          setLoanForm(prev => ({
            ...prev,
            term_months: groupSettingsData.loan_term_months || 12,
            interest_rate: groupSettingsData.interest_rate_per_month || 2.0
          }))
        }
      }

      const { data: contribData } = await db.getContributions(memberId)
      setContributions(contribData || [])

      const { data: loanData } = await db.getLoans(memberId)
      setLoans(loanData || [])

      // Fetch loan payments for all loans
      if (loanData && loanData.length > 0) {
        const loanIds = loanData.map(l => l.id)
        const { data: paymentsData } = await db.supabase
          .from('loan_payments')
          .select('*')
          .in('loan_id', loanIds)
          .order('payment_date', { ascending: false })

        // Group payments by loan_id
        const paymentsByLoan = {}
        if (paymentsData) {
          paymentsData.forEach(payment => {
            if (!paymentsByLoan[payment.loan_id]) {
              paymentsByLoan[payment.loan_id] = []
            }
            paymentsByLoan[payment.loan_id].push(payment)
          })
        }
        setLoanPayments(paymentsByLoan)
      }
    } catch (error) {
      console.error('Error loading member data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddContribution = async (e) => {
    e.preventDefault()
    try {
      const { error } = await db.supabase
        .from('contributions')
        .insert({
          member_id: memberId,
          group_id: member.group_id,
          amount: parseFloat(contributionForm.amount),
          payment_method: contributionForm.payment_method,
          contribution_date: contributionForm.contribution_date,
          status: 'approved',
          approved_at: new Date().toISOString(),
          notes: contributionForm.notes || null
        })

      if (error) throw error
      alert('Contribution recorded successfully!')
      setShowAddContribution(false)
      setContributionForm({ amount: '', payment_method: 'cash', contribution_date: new Date().toISOString().split('T')[0], notes: '' })
      loadMemberData()
    } catch (error) {
      alert('Error: ' + error.message)
    }
  }

  const handleScheduleLoan = async (e) => {
    e.preventDefault()
    try {
      const { error } = await db.supabase
        .from('loans')
        .insert({
          member_id: memberId,
          group_id: member.group_id,
          amount: parseFloat(loanForm.amount),
          purpose: loanForm.purpose,
          status: 'scheduled',
          scheduled_date: loanForm.scheduled_date,
          term_months: loanForm.term_months,
          interest_rate: loanForm.interest_rate
        })

      if (error) throw error
      alert('Loan scheduled! Will appear for approval on scheduled date.')
      setShowScheduleLoan(false)
      setLoanForm({
        amount: '',
        purpose: '',
        scheduled_date: new Date().toISOString().split('T')[0],
        term_months: groupSettings.loan_term_months || 12,
        interest_rate: groupSettings.interest_rate_per_month || 2.0
      })
      loadMemberData()
    } catch (error) {
      alert('Error: ' + error.message)
    }
  }

  const handleMakePayment = async (e) => {
    e.preventDefault()

    if (!paymentForm.amount || !selectedLoanId) {
      alert('Please enter payment amount')
      return
    }

    try {
      const selectedLoan = loans.find(l => l.id === selectedLoanId)
      if (!selectedLoan) {
        alert('Loan not found')
        return
      }

      // Record the payment
      // Trigger will automatically award points if applicable
      const { error: paymentError } = await db.supabase
        .from('loan_payments')
        .insert({
          loan_id: selectedLoanId,
          amount: parseFloat(paymentForm.amount),
          payment_method: paymentForm.payment_method,
          payment_date: paymentForm.payment_date,
          notes: paymentForm.notes || null
        })

      if (paymentError) throw paymentError

      alert('Payment recorded successfully!')
      setShowMakePayment(false)
      setPaymentForm({ amount: '', payment_method: 'cash', payment_date: new Date().toISOString().split('T')[0], notes: '' })
      setSelectedLoanId(null)
      loadMemberData()
    } catch (error) {
      console.error('Error recording payment:', error)
      alert('Error recording payment: ' + error.message)
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      active: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
      scheduled: 'bg-purple-100 text-purple-800'
    }
    return badges[status] || 'bg-gray-100 text-gray-800'
  }

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>
  if (!member) return <div className="text-center py-12"><p>Member not found</p><Link to="/admin/members" className="btn-primary mt-4">Back</Link></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/admin/members" className="btn-secondary"><ArrowLeft className="w-5 h-5" /></Link>
          <div>
            <h1 className="text-3xl font-bold">{member.full_name}</h1>
            <p className="text-gray-600">{member.email}</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button onClick={() => setShowAddContribution(true)} className="btn-primary flex items-center space-x-2">
            <Plus className="w-5 h-5" /><span>Record Contribution</span>
          </button>
          <button onClick={() => setShowScheduleLoan(true)} className="btn-secondary flex items-center space-x-2">
            <Clock className="w-5 h-5" /><span>Schedule Loan</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-600">Share Capital</p><p className="text-2xl font-bold">₱{(member.share_capital || 0).toLocaleString()}</p></div>
            <DollarSign className="w-10 h-10 text-green-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-600">Contributions</p><p className="text-2xl font-bold">{contributions.length}</p></div>
            <User className="w-10 h-10 text-blue-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-600">Loans</p><p className="text-2xl font-bold">{loans.length}</p></div>
            <CreditCard className="w-10 h-10 text-orange-600" />
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold mb-4">Contributions</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Amount</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Method</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {contributions.length === 0 ? <tr><td colSpan="4" className="px-4 py-8 text-center text-gray-500">No contributions</td></tr> :
                contributions.map((c) => (
                  <tr key={c.id}>
                    <td className="px-4 py-3 text-sm">{format(new Date(c.contribution_date), 'MMM d, yyyy')}</td>
                    <td className="px-4 py-3 text-sm font-medium">₱{c.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm capitalize">{c.payment_method}</td>
                    <td className="px-4 py-3 text-sm"><span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(c.status)}`}>{c.status}</span></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold mb-4">Loans</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Amount</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Purpose</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Balance</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loans.length === 0 ? <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-500">No loans</td></tr> :
                loans.map((l) => (
                  <>
                    <tr key={l.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{l.scheduled_date ? format(new Date(l.scheduled_date), 'MMM d, yyyy') : format(new Date(l.created_at), 'MMM d, yyyy')}</td>
                      <td className="px-4 py-3 text-sm font-medium">₱{l.amount.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm">{l.purpose}</td>
                      <td className="px-4 py-3 text-sm"><span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(l.status)}`}>{l.status}</span></td>
                      <td className="px-4 py-3 text-sm font-medium">₱{(l.balance || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm space-x-2">
                        {l.status === 'active' && l.balance > 0 && (
                          <button
                            onClick={() => {
                              setSelectedLoanId(l.id)
                              setPaymentForm({ ...paymentForm, amount: '' })
                              setShowMakePayment(true)
                            }}
                            className="btn-primary text-xs px-3 py-1"
                          >
                            Pay
                          </button>
                        )}
                        {loanPayments[l.id] && loanPayments[l.id].length > 0 && (
                          <button
                            onClick={() => setExpandedLoanId(expandedLoanId === l.id ? null : l.id)}
                            className="text-blue-600 hover:text-blue-800 text-xs underline"
                          >
                            {expandedLoanId === l.id ? 'Hide' : 'View'} Payments ({loanPayments[l.id].length})
                          </button>
                        )}
                      </td>
                    </tr>
                    {expandedLoanId === l.id && loanPayments[l.id] && (
                      <tr key={`${l.id}-payments`}>
                        <td colSpan="6" className="px-4 py-3 bg-gray-50">
                          <div className="ml-8">
                            <h4 className="font-semibold text-sm mb-2">Payment History</h4>
                            <table className="w-full text-sm">
                              <thead className="bg-white">
                                <tr>
                                  <th className="px-3 py-2 text-left text-xs font-semibold">Date</th>
                                  <th className="px-3 py-2 text-left text-xs font-semibold">Amount</th>
                                  <th className="px-3 py-2 text-left text-xs font-semibold">Method</th>
                                  <th className="px-3 py-2 text-left text-xs font-semibold">Notes</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y">
                                {loanPayments[l.id].map((payment) => (
                                  <tr key={payment.id}>
                                    <td className="px-3 py-2 text-xs">{format(new Date(payment.payment_date), 'MMM d, yyyy')}</td>
                                    <td className="px-3 py-2 text-xs font-medium text-green-600">₱{payment.amount.toLocaleString()}</td>
                                    <td className="px-3 py-2 text-xs capitalize">{payment.payment_method}</td>
                                    <td className="px-3 py-2 text-xs text-gray-600">{payment.notes || '-'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddContribution && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Record Contribution</h3>
            <form onSubmit={handleAddContribution} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Amount (₱)</label>
                <input type="number" required value={contributionForm.amount} onChange={(e) => setContributionForm({...contributionForm, amount: e.target.value})} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Payment Method</label>
                <select value={contributionForm.payment_method} onChange={(e) => setContributionForm({...contributionForm, payment_method: e.target.value})} className="input-field">
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="gcash">GCash</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input type="date" required value={contributionForm.contribution_date} onChange={(e) => setContributionForm({...contributionForm, contribution_date: e.target.value})} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes (optional)</label>
                <textarea value={contributionForm.notes} onChange={(e) => setContributionForm({...contributionForm, notes: e.target.value})} className="input-field" rows="2"></textarea>
              </div>
              <div className="flex space-x-3">
                <button type="submit" className="btn-primary flex-1">Record</button>
                <button type="button" onClick={() => setShowAddContribution(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showScheduleLoan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Schedule Loan Application</h3>
            <form onSubmit={handleScheduleLoan} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Amount (₱)</label>
                <input type="number" required value={loanForm.amount} onChange={(e) => setLoanForm({...loanForm, amount: e.target.value})} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Purpose</label>
                <input type="text" required value={loanForm.purpose} onChange={(e) => setLoanForm({...loanForm, purpose: e.target.value})} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Scheduled Date</label>
                <input type="date" required value={loanForm.scheduled_date} onChange={(e) => setLoanForm({...loanForm, scheduled_date: e.target.value})} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Term (months)</label>
                <input type="number" min="1" max="36" value={loanForm.term_months} onChange={(e) => setLoanForm({...loanForm, term_months: parseInt(e.target.value) || 12})} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Interest Rate (%/month)</label>
                <input type="number" min="0" max="10" step="0.1" value={loanForm.interest_rate} onChange={(e) => setLoanForm({...loanForm, interest_rate: parseFloat(e.target.value) || 2.0})} className="input-field" />
              </div>
              <div className="flex space-x-3">
                <button type="submit" className="btn-primary flex-1">Schedule</button>
                <button type="button" onClick={() => setShowScheduleLoan(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showMakePayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Record Loan Payment</h3>
            <form onSubmit={handleMakePayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Amount (₱) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                  className="input-field"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Payment Method</label>
                <select value={paymentForm.payment_method} onChange={(e) => setPaymentForm({...paymentForm, payment_method: e.target.value})} className="input-field">
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="gcash">GCash</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Payment Date</label>
                <input
                  type="date"
                  required
                  value={paymentForm.payment_date}
                  onChange={(e) => setPaymentForm({...paymentForm, payment_date: e.target.value})}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes (optional)</label>
                <textarea
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({...paymentForm, notes: e.target.value})}
                  className="input-field"
                  rows="2"
                ></textarea>
              </div>
              <div className="flex space-x-3">
                <button type="submit" className="btn-primary flex-1">Record Payment</button>
                <button type="button" onClick={() => setShowMakePayment(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

