import { useState } from 'react'
import { db } from '../../lib/supabase'
import { UserPlus, Mail, Phone, User, DollarSign, Key, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function AddMember() {
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    phone: '',
    initial_capital: '1000'
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(null)

    try {
      // Get current user's group_id
      const { data: { user } } = await db.supabase.auth.getUser()
      const { data: memberData } = await db.supabase
        .from('members')
        .select('group_id')
        .eq('user_id', user.id)
        .single()

      const { data, error } = await db.supabase.rpc('admin_create_member', {
        p_email: formData.email,
        p_full_name: formData.full_name,
        p_phone: formData.phone || null,
        p_group_id: memberData.group_id,
        p_initial_capital: parseFloat(formData.initial_capital)
      })

      if (error) {
        console.error('Error creating member:', error)
        alert('Error creating member: ' + error.message)
        return
      }

      setSuccess({
        email: formData.email,
        full_name: formData.full_name,
        temp_password: data.temp_password
      })

      // Reset form
      setFormData({
        email: '',
        full_name: '',
        phone: '',
        initial_capital: '1000'
      })
    } catch (error) {
      console.error('Error:', error)
      alert('Error creating member: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <UserPlus className="w-8 h-8 text-primary-600" />
          <h1 className="text-3xl font-bold">Add New Member</h1>
        </div>
        <Link to="/admin/members" className="btn-secondary">
          View All Members
        </Link>
      </div>

      {/* Success Message */}
      {success && (
        <div className="card bg-green-50 border-green-200">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-bold text-green-900 mb-2">Member Created Successfully!</h3>
              <div className="space-y-2 text-sm text-green-800">
                <p><strong>Name:</strong> {success.full_name}</p>
                <p><strong>Email:</strong> {success.email}</p>
                <div className="bg-white border border-green-300 rounded-lg p-3 mt-3">
                  <p className="font-semibold mb-1">Temporary Password:</p>
                  <code className="text-lg font-mono bg-green-100 px-3 py-2 rounded block">
                    {success.temp_password}
                  </code>
                  <p className="text-xs text-green-700 mt-2">
                    ⚠️ Share this password with the member. They should change it on first login.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSuccess(null)}
                className="btn-primary mt-4"
              >
                Add Another Member
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Form */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Member Information</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">
              <Mail className="w-4 h-4 inline mr-2" />
              Email Address *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="input-field"
              placeholder="member@example.com"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Used for login and notifications
            </p>
          </div>

          <div>
            <label className="label">
              <User className="w-4 h-4 inline mr-2" />
              Full Name *
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => handleChange('full_name', e.target.value)}
              className="input-field"
              placeholder="Juan Dela Cruz"
              required
            />
          </div>

          <div>
            <label className="label">
              <Phone className="w-4 h-4 inline mr-2" />
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="input-field"
              placeholder="+63 912 345 6789"
            />
            <p className="text-sm text-gray-500 mt-1">
              Optional - for SMS notifications
            </p>
          </div>

          <div>
            <label className="label">
              <DollarSign className="w-4 h-4 inline mr-2" />
              Initial Capital (₱)
            </label>
            <input
              type="number"
              value={formData.initial_capital}
              onChange={(e) => handleChange('initial_capital', e.target.value)}
              className="input-field"
              placeholder="1000"
              min="0"
              step="100"
            />
            <p className="text-sm text-gray-500 mt-1">
              Starting share capital amount (can be 0)
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <Key className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Automatic Password Generation</p>
                <p>
                  A temporary password will be automatically generated and displayed after creation.
                  The member should change this password on their first login.
                </p>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center space-x-2"
            >
              <UserPlus className="w-5 h-5" />
              <span>{loading ? 'Creating...' : 'Create Member'}</span>
            </button>
            <button
              type="button"
              onClick={() => setFormData({
                email: '',
                full_name: '',
                phone: '',
                initial_capital: '1000'
              })}
              className="btn-secondary"
            >
              Clear Form
            </button>
          </div>
        </form>
      </div>

      {/* Instructions */}
      <div className="card bg-gray-50">
        <h3 className="font-bold mb-3">How It Works:</h3>
        <ol className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start space-x-2">
            <span className="font-bold text-primary-600">1.</span>
            <span>Fill in the member's information above</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="font-bold text-primary-600">2.</span>
            <span>System creates account with temporary password</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="font-bold text-primary-600">3.</span>
            <span>Share the temporary password with the member</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="font-bold text-primary-600">4.</span>
            <span>Member logs in and changes password</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="font-bold text-primary-600">5.</span>
            <span>Member can start contributing and applying for loans</span>
          </li>
        </ol>
      </div>

      {/* Alternative Methods */}
      <div className="card">
        <h3 className="font-bold mb-3">Alternative Methods:</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-start space-x-3">
            <div className="bg-primary-100 p-2 rounded">
              <Mail className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="font-semibold">Bulk Import (Coming Soon)</p>
              <p className="text-gray-600">Upload CSV file to add multiple members at once</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-primary-100 p-2 rounded">
              <UserPlus className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="font-semibold">Invite Link (Coming Soon)</p>
              <p className="text-gray-600">Generate invitation link for members to self-register</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

