import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../lib/supabase'
import { DollarSign, Plus, Clock, CheckCircle, XCircle, CreditCard, AlertCircle } from 'lucide-react'

export default function Loans() {
  const { member } = useAuth()
  const [loans, setLoans] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNewLoanForm, setShowNewLoanForm] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedLoan, setSelectedLoan] = useState(null)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [newLoan, setNewLoan] = useState({
    amount: '',
    purpose: '',
    term_months: 3
  })

  useEffect(() => {
    if (member?.id) {
      loadLoans()
    }
  }, [member])

  const loadLoans = async () => {
    if (!member?.id) return

    try {
      const { data } = await db.getLoans(member.id)
      setLoans(data || [])
    } catch (error) {
      console.error('Error loading loans:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitLoan = async (e) => {
    e.preventDefault()

    if (!member?.id) {
      alert('Error: Member data not loaded. Please refresh the page.')
      return
    }

    try {
      await db.createLoan({
        member_id: member.id,
        amount: parseFloat(newLoan.amount),
        purpose: newLoan.purpose,
        term_months: parseInt(newLoan.term_months),
        interest_rate: 2.0, // 2% per month
        status: 'pending'
      })
      setShowNewLoanForm(false)
      setNewLoan({ amount: '', purpose: '', term_months: 3 })
      await loadLoans()
      alert('Loan application submitted successfully!')
    } catch (error) {
      console.error('Error submitting loan:', error)
      alert('Error submitting loan: ' + error.message)
    }
  }

  const handleMakePayment = async (e) => {
    e.preventDefault()

    if (!selectedLoan || !paymentAmount) return

    try {
      // Record the payment
      // Trigger will automatically award points if applicable
      const { error: paymentError } = await db.supabase
        .from('loan_payments')
        .insert({
          loan_id: selectedLoan.id,
          amount: parseFloat(paymentAmount),
          payment_method: 'cash',
          payment_date: new Date().toISOString().split('T')[0],
          is_late: false
        })

      if (paymentError) {
        console.error('Error inserting payment:', paymentError)
        throw paymentError
      }

      setShowPaymentModal(false)
      setSelectedLoan(null)
      setPaymentAmount('')
      await loadLoans()
      alert('Payment recorded successfully!')
    } catch (error) {
      console.error('Error recording payment:', error)
      alert('Error recording payment: ' + error.message)
    }
  }

  const openPaymentModal = (loan) => {
    setSelectedLoan(loan)
    setPaymentAmount(loan.balance?.toString() || '')
    setShowPaymentModal(true)
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />
      case 'paid':
        return <CheckCircle className="w-5 h-5 text-blue-600" />
      case 'defaulted':
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return <Clock className="w-5 h-5 text-gray-600" />
    }
  }

  if (loading) {
    return <div className="flex justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Loans</h1>
        <button
          onClick={() => setShowNewLoanForm(!showNewLoanForm)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Apply for Loan</span>
        </button>
      </div>

      {/* New Loan Form */}
      {showNewLoanForm && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4">New Loan Application</h2>
          <form onSubmit={handleSubmitLoan} className="space-y-4">
            <div>
              <label className="label">Loan Amount (₱)</label>
              <input
                type="number"
                value={newLoan.amount}
                onChange={(e) => setNewLoan({ ...newLoan, amount: e.target.value })}
                className="input-field"
                placeholder="10000"
                required
                min="1000"
                max="50000"
              />
              <p className="text-sm text-gray-500 mt-1">
                Maximum: ₱50,000 | Interest: 2% per month
              </p>
            </div>

            <div>
              <label className="label">Purpose</label>
              <textarea
                value={newLoan.purpose}
                onChange={(e) => setNewLoan({ ...newLoan, purpose: e.target.value })}
                className="input-field"
                placeholder="Business capital, emergency, etc."
                rows="3"
                required
              />
            </div>

            <div>
              <label className="label">Term (Months)</label>
              <select
                value={newLoan.term_months}
                onChange={(e) => setNewLoan({ ...newLoan, term_months: e.target.value })}
                className="input-field"
              >
                <option value="3">3 months</option>
                <option value="6">6 months</option>
                <option value="12">12 months</option>
              </select>
            </div>

            <div className="flex space-x-3">
              <button type="submit" className="btn-primary">
                Submit Application
              </button>
              <button
                type="button"
                onClick={() => setShowNewLoanForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Loans List */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Loan History</h2>
        {loans.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No loans yet</p>
            <p className="text-sm text-gray-400">
              Apply for your first loan to start earning participation points!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {loans.map((loan) => {
              const totalWithInterest = parseFloat(loan.amount) * (1 + (parseFloat(loan.interest_rate) / 100) * loan.term_months)
              const balance = loan.balance || totalWithInterest
              const paid = totalWithInterest - balance

              return (
                <div key={loan.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-3">
                      {getStatusIcon(loan.status)}
                      <div>
                        <h3 className="font-semibold text-lg">
                          ₱{parseFloat(loan.amount).toLocaleString()}
                        </h3>
                        <p className="text-sm text-gray-600">{loan.purpose}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span>Term: {loan.term_months} months</span>
                          <span>Rate: {loan.interest_rate}%/month</span>
                          <span>Applied: {new Date(loan.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      loan.status === 'active' ? 'bg-green-100 text-green-800' :
                      loan.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      loan.status === 'paid' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                    </span>
                  </div>

                  {/* Loan Details */}
                  {loan.status === 'active' && (
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Principal:</span>
                        <span className="font-medium">₱{parseFloat(loan.amount).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total with Interest:</span>
                        <span className="font-medium">₱{totalWithInterest.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Paid:</span>
                        <span className="font-medium text-green-600">₱{paid.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm border-t pt-2">
                        <span className="text-gray-600 font-semibold">Balance:</span>
                        <span className="font-bold text-lg">₱{balance.toLocaleString()}</span>
                      </div>

                      <button
                        onClick={() => openPaymentModal(loan)}
                        className="btn-primary w-full mt-3 flex items-center justify-center space-x-2"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Make Payment</span>
                      </button>
                    </div>
                  )}

                  {loan.status === 'pending' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start space-x-2">
                      <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-yellow-800">
                        <p className="font-medium">Pending Approval</p>
                        <p className="text-yellow-700">Your loan application is being reviewed by an admin.</p>
                      </div>
                    </div>
                  )}

                  {loan.status === 'paid' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                      <p className="text-sm text-blue-800 font-medium">✓ Loan Fully Paid</p>
                      <p className="text-xs text-blue-600 mt-1">Thank you for your timely payments!</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedLoan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Make Loan Payment</h2>
            <form onSubmit={handleMakePayment} className="space-y-4">
              <div>
                <label className="label">Loan Amount</label>
                <p className="text-2xl font-bold text-gray-900">
                  ₱{parseFloat(selectedLoan.amount).toLocaleString()}
                </p>
              </div>

              <div>
                <label className="label">Current Balance</label>
                <p className="text-2xl font-bold text-red-600">
                  ₱{(selectedLoan.balance || 0).toLocaleString()}
                </p>
              </div>

              <div>
                <label className="label">Payment Amount (₱)</label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="input-field"
                  placeholder="Enter amount"
                  required
                  min="100"
                  max={selectedLoan.balance}
                  step="0.01"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Minimum: ₱100 | Maximum: ₱{(selectedLoan.balance || 0).toLocaleString()}
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800">
                  <strong>Reward:</strong> You'll earn +5 points for this payment!
                </p>
              </div>

              <div className="flex space-x-3">
                <button type="submit" className="btn-primary flex-1">
                  Confirm Payment
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentModal(false)
                    setSelectedLoan(null)
                    setPaymentAmount('')
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

