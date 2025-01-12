import { useEffect, useState } from 'react'
import { db } from '../../lib/supabase'
import { Users, Search, UserPlus, Mail, Phone, Calendar, Shield, Edit, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'

export default function Members() {
  const [members, setMembers] = useState([])
  const [filteredMembers, setFilteredMembers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    admins: 0,
    active: 0,
    inactive: 0
  })

  useEffect(() => {
    loadMembers()
  }, [])

  useEffect(() => {
    filterMembers()
  }, [searchQuery, filterRole, members])

  const loadMembers = async () => {
    try {
      const { data: membersData } = await db.getMembers()
      setMembers(membersData || [])

      // Calculate stats
      const total = membersData?.length || 0
      const admins = membersData?.filter(m => m.admin_role).length || 0
      const active = membersData?.filter(m => m.status === 'active').length || 0
      const inactive = total - active

      setStats({ total, admins, active, inactive })
    } catch (error) {
      console.error('Error loading members:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterMembers = () => {
    let filtered = members

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(m =>
        m.full_name?.toLowerCase().includes(query) ||
        m.email?.toLowerCase().includes(query) ||
        m.phone?.toLowerCase().includes(query)
      )
    }

    // Filter by role
    if (filterRole !== 'all') {
      if (filterRole === 'admin') {
        filtered = filtered.filter(m => m.admin_role)
      } else if (filterRole === 'member') {
        filtered = filtered.filter(m => !m.admin_role)
      }
    }

    setFilteredMembers(filtered)
  }

  const getRoleBadge = (member) => {
    if (member.admin_role === 'super_admin') {
      return <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">Super Admin</span>
    } else if (member.admin_role === 'finance_admin') {
      return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Finance Admin</span>
    } else if (member.admin_role === 'operations_admin') {
      return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Operations Admin</span>
    } else {
      return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">Member</span>
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Users className="w-8 h-8 text-primary-600" />
          <h1 className="text-3xl font-bold">Members Management</h1>
        </div>
        <Link to="/admin/add-member" className="btn-primary flex items-center space-x-2">
          <UserPlus className="w-5 h-5" />
          <span>Add Member</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Members</p>
              <p className="text-3xl font-bold">{stats.total}</p>
            </div>
            <Users className="w-12 h-12 text-gray-400" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Admins</p>
              <p className="text-3xl font-bold text-purple-600">{stats.admins}</p>
            </div>
            <Shield className="w-12 h-12 text-purple-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-3xl font-bold text-green-600">{stats.active}</p>
            </div>
            <Users className="w-12 h-12 text-green-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Inactive</p>
              <p className="text-3xl font-bold text-red-600">{stats.inactive}</p>
            </div>
            <Users className="w-12 h-12 text-red-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="input-field md:w-48"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admins Only</option>
            <option value="member">Members Only</option>
          </select>
        </div>
      </div>

      {/* Members Table */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">
          Members ({filteredMembers.length})
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Phone</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Role</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Share Capital</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Points</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Joined</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                    No members found
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">
                      <Link to={`/admin/members/${member.id}`} className="text-primary-600 hover:text-primary-800 hover:underline">
                        {member.full_name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span>{member.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {member.phone ? (
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>{member.phone}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {getRoleBadge(member)}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">
                      ₱{(member.share_capital || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-primary-600">
                      {member.total_points || 0}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>
                          {member.created_at
                            ? format(new Date(member.created_at), 'MMM d, yyyy')
                            : '-'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center space-x-2">
                        <button
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit member"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800"
                          title="Delete member"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

