import { useEffect, useState } from 'react'
import { db } from '../../lib/supabase'
import { Settings, Save, DollarSign, Award, Calendar, Percent } from 'lucide-react'

export default function GroupSettings() {
  const [settings, setSettings] = useState({
    // Basic settings - use actual database column names
    minimum_monthly_capital: 1000,
    interest_rate_per_month: 2.0,
    loan_term_months: 12,
    max_loan_multiplier: 3,
    contribution_due_day: 5,
    late_contribution_penalty_days: 5,
    yearend_payout_date: '12-20',
    platform_interest_share: 5.0,

    // Fee settings
    membership_fee_amount: 500,
    management_fee_percentage: 10.0,
    admin_commission_percentage: 5.0,

    // Quota-based dividend settings
    required_loan_interest_quota: 5000,
    withdrawal_waiting_period_days: 30,
    enable_quota_based_dividends: true
  })
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [groupId, setGroupId] = useState(null)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      // Get the first group (for now, we'll use the default group)
      const { data: groups } = await db.supabase
        .from('groups')
        .select('*')
        .limit(1)
        .single()

      if (groups) {
        setGroupId(groups.id)
        
        // Get group settings
        const { data: groupSettings } = await db.supabase
          .from('group_settings')
          .select('*')
          .eq('group_id', groups.id)
          .single()

        if (groupSettings) {
          setSettings({
            minimum_monthly_capital: parseFloat(groupSettings.minimum_monthly_capital) || 1000,
            interest_rate_per_month: parseFloat(groupSettings.interest_rate_per_month) ?? 2.0,
            loan_term_months: parseInt(groupSettings.loan_term_months) || 12,
            max_loan_multiplier: parseFloat(groupSettings.max_loan_multiplier) ?? 3,
            contribution_due_day: parseInt(groupSettings.contribution_due_day) || 5,
            late_contribution_penalty_days: parseInt(groupSettings.late_contribution_penalty_days) ?? 5,
            yearend_payout_date: groupSettings.yearend_payout_date || '12-20',
            platform_interest_share: parseFloat(groupSettings.platform_interest_share) ?? 5.0,
            membership_fee_amount: parseFloat(groupSettings.membership_fee_amount) || 500,
            management_fee_percentage: parseFloat(groupSettings.management_fee_percentage) || 10,
            admin_commission_percentage: parseFloat(groupSettings.admin_commission_percentage) || 5,
            required_loan_interest_quota: parseFloat(groupSettings.required_loan_interest_quota) || 5000,
            withdrawal_waiting_period_days: parseInt(groupSettings.withdrawal_waiting_period_days) || 30,
            enable_quota_based_dividends: groupSettings.enable_quota_based_dividends !== false
          })
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!groupId) {
      alert('No group found. Please create a group first.')
      return
    }

    setSaving(true)
    try {
      // Use update instead of upsert to avoid unique constraint issues
      const { error } = await db.supabase
        .from('group_settings')
        .update({
          ...settings,
          updated_at: new Date().toISOString()
        })
        .eq('group_id', groupId)

      if (error) throw error

      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Error saving settings: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field, value) => {
    // Ensure value is not NaN
    let finalValue = value
    if (typeof value === 'number' && isNaN(value)) {
      finalValue = 0
    }
    setSettings(prev => ({
      ...prev,
      [field]: finalValue
    }))
  }

  // Helper to safely display numeric values
  const safeValue = (val) => {
    if (val === null || val === undefined || isNaN(val)) return ''
    return val
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Settings className="w-8 h-8 text-primary-600" />
          <h1 className="text-3xl font-bold">Group Settings</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center space-x-2"
        >
          <Save className="w-5 h-5" />
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      {/* Financial Settings */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <DollarSign className="w-6 h-6 text-primary-600" />
          <h2 className="text-xl font-bold">Financial Settings</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Minimum Monthly Contribution (₱)</label>
            <input
              type="number"
              value={safeValue(settings.minimum_monthly_capital)}
              onChange={(e) => handleChange('minimum_monthly_capital', parseFloat(e.target.value) || 1000)}
              className="input-field"
              min="100"
              step="100"
            />
            <p className="text-sm text-gray-500 mt-1">
              Minimum amount members must contribute monthly
            </p>
          </div>

          <div>
            <label className="label">Loan Interest Rate (%/month)</label>
            <input
              type="number"
              value={safeValue(settings.interest_rate_per_month)}
              onChange={(e) => {
                const val = e.target.value === '' ? 0 : parseFloat(e.target.value)
                handleChange('interest_rate_per_month', isNaN(val) ? 0 : val)
              }}
              className="input-field"
              min="0"
              max="10"
              step="0.1"
            />
            <p className="text-sm text-gray-500 mt-1">
              Monthly interest rate for loans
            </p>
          </div>

          <div>
            <label className="label">Max Loan Term (months)</label>
            <input
              type="number"
              value={safeValue(settings.loan_term_months)}
              onChange={(e) => handleChange('loan_term_months', parseInt(e.target.value) || 12)}
              className="input-field"
              min="1"
              max="36"
            />
            <p className="text-sm text-gray-500 mt-1">
              Maximum loan duration in months
            </p>
          </div>

          <div>
            <label className="label">Max Loan Multiplier</label>
            <input
              type="number"
              value={safeValue(settings.max_loan_multiplier)}
              onChange={(e) => {
                const val = e.target.value === '' ? 0 : parseFloat(e.target.value)
                handleChange('max_loan_multiplier', isNaN(val) ? 0 : val)
              }}
              className="input-field"
              min="0"
              max="10"
            />
            <p className="text-sm text-gray-500 mt-1">
              Max loan = Share Capital × This number
            </p>
          </div>

          <div>
            <label className="label">Platform Fee (%)</label>
            <input
              type="number"
              value={safeValue(settings.platform_interest_share)}
              onChange={(e) => {
                const val = e.target.value === '' ? 0 : parseFloat(e.target.value)
                handleChange('platform_interest_share', isNaN(val) ? 0 : val)
              }}
              className="input-field"
              min="0"
              max="20"
              step="0.5"
            />
            <p className="text-sm text-gray-500 mt-1">
              Percentage of interest for platform
            </p>
          </div>
        </div>
      </div>

      {/* Fee Management Settings */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <Percent className="w-6 h-6 text-primary-600" />
          <h2 className="text-xl font-bold">Fee Management</h2>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-800">
            <strong>How Fees Work:</strong><br/>
            • <strong>Membership Fee:</strong> One-time fee when member joins (goes to management)<br/>
            • <strong>Management Fee:</strong> Percentage deducted from each contribution (for operations)<br/>
            • <strong>Admin Commission:</strong> Your share of the management fees collected<br/>
            • <strong>Platform Share:</strong> Remaining amount after admin commission
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Membership Fee (₱)</label>
            <input
              type="number"
              value={safeValue(settings.membership_fee_amount)}
              onChange={(e) => handleChange('membership_fee_amount', parseFloat(e.target.value) || 500)}
              className="input-field"
              min="0"
              step="50"
            />
            <p className="text-sm text-gray-500 mt-1">
              One-time fee when member joins (default: ₱500)
            </p>
          </div>

          <div>
            <label className="label">Management Fee (%)</label>
            <input
              type="number"
              value={safeValue(settings.management_fee_percentage)}
              onChange={(e) => {
                const val = e.target.value === '' ? 0 : parseFloat(e.target.value)
                handleChange('management_fee_percentage', isNaN(val) ? 0 : val)
              }}
              className="input-field"
              min="0"
              max="20"
              step="0.5"
            />
            <p className="text-sm text-gray-500 mt-1">
              Deducted from each contribution (default: 10%)
            </p>
          </div>

          <div>
            <label className="label">Admin Commission (%)</label>
            <input
              type="number"
              value={safeValue(settings.admin_commission_percentage)}
              onChange={(e) => handleChange('admin_commission_percentage', parseFloat(e.target.value) || 5)}
              className="input-field"
              min="0"
              max="50"
              step="1"
            />
            <p className="text-sm text-gray-500 mt-1">
              Your share of management fees (default: 5%)
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-semibold mb-2">Example Calculation:</p>
            <p className="text-xs text-gray-600">
              Member contributes ₱1,000<br/>
              Management fee (10%): ₱100<br/>
              Admin commission (5% of ₱100): ₱5<br/>
              Platform share: ₱95<br/>
              Member's capital: ₱900
            </p>
          </div>
        </div>
      </div>

      {/* Date Settings */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <Calendar className="w-6 h-6 text-primary-600" />
          <h2 className="text-xl font-bold">Date Settings</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Contribution Due Day</label>
            <input
              type="number"
              value={safeValue(settings.contribution_due_day)}
              onChange={(e) => handleChange('contribution_due_day', parseInt(e.target.value) || 5)}
              className="input-field"
              min="1"
              max="28"
            />
            <p className="text-sm text-gray-500 mt-1">
              Day of month when contributions are due (1-28)
            </p>
          </div>

          <div>
            <label className="label">Late Penalty Grace Period (days)</label>
            <input
              type="number"
              value={safeValue(settings.late_contribution_penalty_days)}
              onChange={(e) => {
                const val = e.target.value === '' ? 0 : parseInt(e.target.value)
                handleChange('late_contribution_penalty_days', isNaN(val) ? 0 : val)
              }}
              className="input-field"
              min="0"
              max="15"
            />
            <p className="text-sm text-gray-500 mt-1">
              Days after due date before penalty applies
            </p>
          </div>

          <div>
            <label className="label">Year-End Payout Date (MM-DD)</label>
            <input
              type="text"
              value={settings.yearend_payout_date}
              onChange={(e) => handleChange('yearend_payout_date', e.target.value)}
              className="input-field"
              placeholder="12-20"
              pattern="\d{2}-\d{2}"
            />
            <p className="text-sm text-gray-500 mt-1">
              Date for annual distribution (e.g., 12-20 for Dec 20)
            </p>
          </div>
        </div>
      </div>

      {/* Quota-Based Dividend Settings */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <Award className="w-6 h-6 text-primary-600" />
          <h2 className="text-xl font-bold">Quota-Based Dividend System</h2>
        </div>

        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-green-800">
              <strong>How It Works:</strong><br/>
              • Members who pay ≥ quota in loan interest get <strong>FULL dividend</strong><br/>
              • Members who pay &lt; quota get <strong>proportional dividend</strong><br/>
              • Members with no loans get <strong>0% dividend</strong><br/>
              • All interest earned is distributed fairly among quota members
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Required Loan Interest Quota (₱)</label>
              <input
                type="number"
                value={safeValue(settings.required_loan_interest_quota)}
                onChange={(e) => handleChange('required_loan_interest_quota', parseFloat(e.target.value) || 5000)}
                className="input-field"
                min="1000"
                step="500"
              />
              <p className="text-sm text-gray-500 mt-1">
                Amount of loan interest needed to qualify for full dividend
              </p>
            </div>

            <div>
              <label className="label">Withdrawal Waiting Period (days)</label>
              <input
                type="number"
                value={safeValue(settings.withdrawal_waiting_period_days)}
                onChange={(e) => handleChange('withdrawal_waiting_period_days', parseInt(e.target.value) || 30)}
                className="input-field"
                min="1"
                max="90"
              />
              <p className="text-sm text-gray-500 mt-1">
                Days to wait after last contribution before withdrawal
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enable_quota_based_dividends}
                  onChange={(e) => handleChange('enable_quota_based_dividends', e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <span className="label">Enable Quota-Based Dividend System</span>
              </label>
              <p className="text-sm text-gray-500 mt-1 ml-7">
                When enabled, dividends are calculated based on loan interest quota instead of points
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-semibold mb-2">📊 Example Calculation (Rough Estimate)</p>
            <p className="text-xs text-gray-500 mb-3 italic">
              ⚠️ <strong>Note:</strong> This is just an example to show how dividend sharing works. Actual dividends will vary based on the number of members, loan activity, and total interest earned at the end of the year.
            </p>
            <p className="text-xs text-gray-600 space-y-1">
              <strong>Scenario:</strong> 100-member group, ₱1,000/month contributions (₱12,000/year)<br/>
              <strong>Loan Activity:</strong> 80 members take loans<br/>
              <strong>Total Interest Earned:</strong> ₱400,000<br/>
              <br/>
              <strong>Quota Calculation (Quota = ₱5,000):</strong><br/>
              • 70 members paid ≥ ₱5,000 interest → Get FULL dividend<br/>
              • 10 members paid ₱2,500 interest → Get 50% dividend<br/>
              • 20 members paid ₱0 interest → Get 0% dividend<br/>
              <br/>
              <strong>Full Dividend Calculation:</strong><br/>
              Full Dividend = ₱400,000 ÷ 70 quota members = ₱5,714.29<br/>
              <br/>
              <strong>Member Payouts (in this example):</strong><br/>
              • Member with ₱5,000+ interest: ₱12,000 (capital) + ₱5,714 (full dividend) = <strong>₱17,714</strong><br/>
              • Member with ₱2,500 interest: ₱12,000 (capital) + ₱2,857 (50% dividend) = <strong>₱14,857</strong><br/>
              • Member with ₱0 interest: ₱12,000 (capital) + ₱0 (no dividend) = <strong>₱12,000</strong><br/>
              <br/>
              <strong>💡 How it works:</strong> The system automatically calculates dividends at year-end based on actual interest earned and member participation.
            </p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center space-x-2"
        >
          <Save className="w-5 h-5" />
          <span>{saving ? 'Saving...' : 'Save All Changes'}</span>
        </button>
      </div>
    </div>
  )
}

