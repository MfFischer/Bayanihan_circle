import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Helper functions for common operations
export const auth = {
  signUp: async (email, password, userData) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: userData.full_name,
          phone: userData.phone
        },
        emailRedirectTo: window.location.origin
      }
    })
    return { data, error }
  },
  
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },
  
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },
  
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },
  
  resetPassword: async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email)
    return { data, error }
  }
}

// Database helper functions
export const db = {
  // Expose supabase client for direct access when needed
  supabase,

  // Members (with share capital from view)
  getMembers: async () => {
    const { data, error } = await supabase
      .from('v_members_with_capital')
      .select('*')
      .order('created_at', { ascending: false })
    return { data, error }
  },
  
  getMemberById: async (id) => {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('id', id)
      .single()
    return { data, error }
  },
  
  updateMember: async (id, updates) => {
    const { data, error } = await supabase
      .from('members')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },
  
  // Contributions
  getContributions: async (memberId = null) => {
    let query = supabase
      .from('contributions')
      .select('*')
      .order('contribution_date', { ascending: false })

    if (memberId) {
      query = query.eq('member_id', memberId)
    }

    const { data, error } = await query
    if (error) {
      console.error('Error fetching contributions:', error)
    }
    return { data, error }
  },

  addContribution: async (contribution) => {
    const { data, error } = await supabase
      .from('contributions')
      .insert(contribution)
      .select()
      .single()
    return { data, error }
  },

  updateContribution: async (contributionId, updates) => {
    const { data, error } = await supabase
      .from('contributions')
      .update(updates)
      .eq('id', contributionId)
      .select()
      .single()
    return { data, error }
  },
  
  // Loans
  getLoans: async (memberId = null) => {
    let query = supabase
      .from('loans')
      .select('*')
      .order('created_at', { ascending: false })

    if (memberId) {
      query = query.eq('member_id', memberId)
    }

    const { data, error } = await query
    if (error) {
      console.error('Error fetching loans:', error)
    }
    return { data, error }
  },
  
  createLoan: async (loan) => {
    const { data, error } = await supabase
      .from('loans')
      .insert(loan)
      .select()
      .single()
    return { data, error }
  },
  
  updateLoan: async (id, updates) => {
    const { data, error } = await supabase
      .from('loans')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  // Transactions
  getTransactions: async (memberId = null) => {
    let query = supabase
      .from('transactions')
      .select('*, members(full_name, email)')
      .order('transaction_date', { ascending: false })

    if (memberId) {
      query = query.eq('member_id', memberId)
    }

    const { data, error } = await query
    return { data, error }
  },

  // Security Logs (Admin only)
  getSecurityLogs: async (limit = 100) => {
    const { data, error } = await supabase
      .from('security_logs')
      .select('*, members(full_name, email)')
      .order('created_at', { ascending: false })
      .limit(limit)
    return { data, error }
  },

  logSecurityAction: async (action, targetType = null, targetId = null, details = null) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: null, error: new Error('Not authenticated') }

    const { data: member } = await supabase
      .from('members')
      .select('id, role')
      .eq('user_id', user.id)
      .single()

    if (!member) return { data: null, error: new Error('Member not found') }

    const { data, error } = await supabase.rpc('log_security_action', {
      p_actor_id: member.id,
      p_actor_role: member.role,
      p_action: action,
      p_target_type: targetType,
      p_target_id: targetId,
      p_details: details
    })
    return { data, error }
  },

  // Wallets
  getWallet: async (ownerId, ownerType = 'admin') => {
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('owner_id', ownerId)
      .eq('owner_type', ownerType)
      .single()
    return { data, error }
  },

  getPlatformWallet: async () => {
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('owner_type', 'platform')
      .single()
    return { data, error }
  },

  getAllWallets: async () => {
    const { data, error } = await supabase
      .from('wallets')
      .select('*, members(full_name, email)')
      .order('balance', { ascending: false })
    return { data, error }
  },

  // Admin Earnings
  getAdminEarnings: async (adminId = null) => {
    let query = supabase
      .from('admin_earnings')
      .select('*')
      .order('created_at', { ascending: false })

    if (adminId) {
      query = query.eq('admin_id', adminId)
    }

    const { data, error } = await query
    return { data, error }
  },

  // Service Fee Transactions
  processServiceFee: async (memberId, transactionType, baseAmount, serviceFee, adminCardOwnerId, description = null) => {
    const { data, error } = await supabase.rpc('process_service_fee_transaction', {
      p_member_id: memberId,
      p_transaction_type: transactionType,
      p_base_amount: baseAmount,
      p_service_fee: serviceFee,
      p_admin_card_owner_id: adminCardOwnerId,
      p_description: description
    })
    return { data, error }
  },

  getServiceFeeTransactions: async (memberId = null) => {
    let query = supabase
      .from('service_fee_transactions')
      .select('*, members!service_fee_transactions_member_id_fkey(full_name, email), admin:members!service_fee_transactions_admin_card_owner_id_fkey(full_name, email)')
      .order('created_at', { ascending: false })

    if (memberId) {
      query = query.eq('member_id', memberId)
    }

    const { data, error } = await query
    return { data, error }
  },

  // Groups Management
  getGroups: async () => {
    const { data, error } = await supabase
      .from('groups')
      .select('*, admin:members!groups_admin_id_fkey(full_name, email), group_settings(*)')
      .order('created_at', { ascending: false })
    return { data, error }
  },

  getGroupById: async (groupId) => {
    const { data, error } = await supabase
      .from('groups')
      .select('*, admin:members!groups_admin_id_fkey(full_name, email), group_settings(*)')
      .eq('id', groupId)
      .single()
    return { data, error }
  },

  createGroup: async (groupData) => {
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .insert(groupData)
      .select()
      .single()

    if (groupError) return { data: null, error: groupError }

    // Create default settings for the group
    const { data: settings, error: settingsError } = await supabase
      .from('group_settings')
      .insert({ group_id: group.id })
      .select()
      .single()

    return { data: { ...group, group_settings: settings }, error: settingsError }
  },

  updateGroup: async (groupId, updates) => {
    const { data, error } = await supabase
      .from('groups')
      .update(updates)
      .eq('id', groupId)
      .select()
      .single()
    return { data, error }
  },

  // Group Settings
  getGroupSettings: async (groupId) => {
    const { data, error } = await supabase
      .from('group_settings')
      .select('*')
      .eq('group_id', groupId)
      .single()
    return { data, error }
  },

  updateGroupSettings: async (groupId, settings) => {
    const { data, error } = await supabase
      .from('group_settings')
      .update(settings)
      .eq('group_id', groupId)
      .select()
      .single()
    return { data, error }
  },

  // Group Memberships
  getGroupMembers: async (groupId) => {
    const { data, error } = await supabase
      .from('group_memberships')
      .select('*, member:members(*)')
      .eq('group_id', groupId)
      .order('joined_at', { ascending: false })
    return { data, error }
  },

  getMemberGroups: async (memberId) => {
    const { data, error } = await supabase
      .from('group_memberships')
      .select('*, group:groups(*, group_settings(*))')
      .eq('member_id', memberId)
      .eq('status', 'active')
    return { data, error }
  },

  addMemberToGroup: async (groupId, memberId, initialCapital = 0) => {
    const { data, error } = await supabase
      .from('group_memberships')
      .insert({
        group_id: groupId,
        member_id: memberId,
        share_capital: initialCapital
      })
      .select()
      .single()
    return { data, error }
  },

  // Admin creates member directly (without registration)
  adminCreateMember: async (email, fullName, phone, groupId, initialCapital = 0) => {
    const { data, error } = await supabase.rpc('admin_create_member', {
      p_email: email,
      p_full_name: fullName,
      p_phone: phone,
      p_group_id: groupId,
      p_initial_capital: initialCapital
    })
    return { data, error }
  },

  // Reward Partners
  getRewardPartners: async () => {
    const { data, error } = await supabase
      .from('reward_partners')
      .select('*')
      .eq('status', 'active')
      .order('name')
    return { data, error }
  },

  createRewardPartner: async (partnerData) => {
    const { data, error } = await supabase
      .from('reward_partners')
      .insert(partnerData)
      .select()
      .single()
    return { data, error }
  },

  // Reward Items
  getRewardItems: async (partnerId = null) => {
    let query = supabase
      .from('reward_items')
      .select('*, partner:reward_partners(*)')
      .in('status', ['active', 'out_of_stock'])
      .order('points_required')

    if (partnerId) {
      query = query.eq('partner_id', partnerId)
    }

    const { data, error } = await query
    return { data, error }
  },

  createRewardItem: async (itemData) => {
    const { data, error } = await supabase
      .from('reward_items')
      .insert(itemData)
      .select()
      .single()
    return { data, error }
  },

  updateRewardItem: async (itemId, updates) => {
    const { data, error } = await supabase
      .from('reward_items')
      .update(updates)
      .eq('id', itemId)
      .select()
      .single()
    return { data, error }
  },

  // Reward Redemptions
  redeemReward: async (rewardItemId, pointsSpent) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: null, error: new Error('Not authenticated') }

    const { data: member } = await supabase
      .from('members')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!member) return { data: null, error: new Error('Member not found') }

    const redemptionCode = `KAP${Date.now().toString(36).toUpperCase()}`

    const { data, error } = await supabase
      .from('reward_redemptions')
      .insert({
        member_id: member.id,
        reward_item_id: rewardItemId,
        points_spent: pointsSpent,
        redemption_code: redemptionCode,
        status: 'pending'
      })
      .select()
      .single()

    return { data, error }
  },

  getRedemptions: async (memberId = null) => {
    let query = supabase
      .from('reward_redemptions')
      .select('*, member:members(full_name, email), reward_item:reward_items(*, partner:reward_partners(*))')
      .order('created_at', { ascending: false })

    if (memberId) {
      query = query.eq('member_id', memberId)
    }

    const { data, error } = await query
    return { data, error }
  },

  // Year-End Distributions
  calculateYearEndDistribution: async (groupId, year) => {
    const { data, error } = await supabase.rpc('calculate_yearend_distribution', {
      p_group_id: groupId,
      p_year: year
    })
    return { data, error }
  },

  getYearEndDistributions: async (groupId = null, year = null) => {
    let query = supabase
      .from('yearend_distributions')
      .select('*, group:groups(name), member:members(full_name, email)')
      .order('created_at', { ascending: false })

    if (groupId) query = query.eq('group_id', groupId)
    if (year) query = query.eq('year', year)

    const { data, error } = await query
    return { data, error }
  },

  processYearEndPayout: async (distributionId) => {
    const { data, error } = await supabase.rpc('process_yearend_payout', {
      p_distribution_id: distributionId
    })
    return { data, error }
  },

  // FAQs
  getFAQs: async (category = null) => {
    let query = supabase
      .from('faqs')
      .select('*')
      .eq('status', 'active')
      .order('order_index')

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query
    return { data, error }
  },

  createFAQ: async (faqData) => {
    const { data, error } = await supabase
      .from('faqs')
      .insert(faqData)
      .select()
      .single()
    return { data, error }
  },

  updateFAQ: async (faqId, updates) => {
    const { data, error } = await supabase
      .from('faqs')
      .update(updates)
      .eq('id', faqId)
      .select()
      .single()
    return { data, error }
  },

  // Admin Management
  promoteToAdmin: async (memberId, adminRole = 'operations_admin') => {
    const { data, error } = await supabase.rpc('promote_to_admin', {
      p_member_id: memberId,
      p_admin_role: adminRole
    })
    return { data, error }
  },

  demoteFromAdmin: async (memberId) => {
    const { data, error } = await supabase.rpc('demote_from_admin', {
      p_member_id: memberId
    })
    return { data, error }
  },

  // ============================================================================
  // QUOTA-BASED DIVIDEND SYSTEM
  // ============================================================================

  // Interest Tracking
  getMemberInterestTracking: async (memberId, year = null) => {
    let query = supabase
      .from('member_interest_tracking')
      .select('*')
      .eq('member_id', memberId)
      .order('year', { ascending: false })

    if (year) {
      query = query.eq('year', year)
    }

    const { data, error } = await query
    return { data, error }
  },

  getInterestTrackingByYear: async (year) => {
    const { data, error } = await supabase
      .from('member_interest_tracking')
      .select('*')
      .eq('year', year)
      .order('total_interest_paid', { ascending: false })
    return { data, error }
  },

  // Year-End Distribution
  calculateYearEndDistribution: async (year) => {
    const { data, error } = await supabase.rpc('calculate_year_end_distribution', {
      p_year: year
    })
    return { data, error }
  },

  getYearEndDistribution: async (year) => {
    const { data, error } = await supabase
      .from('year_end_distribution')
      .select('*')
      .eq('year', year)
      .single()
    return { data, error }
  },

  createYearEndDistribution: async (distributionData) => {
    const { data, error } = await supabase
      .from('year_end_distribution')
      .insert(distributionData)
      .select()
      .single()
    return { data, error }
  },

  updateYearEndDistribution: async (id, updates) => {
    const { data, error } = await supabase
      .from('year_end_distribution')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  // Withdrawal Management
  checkWithdrawalEligibility: async (memberId) => {
    const { data, error } = await supabase.rpc('check_withdrawal_eligibility', {
      p_member_id: memberId
    })
    return { data, error }
  },

  requestWithdrawal: async (withdrawalData) => {
    const { data, error } = await supabase
      .from('member_withdrawals')
      .insert(withdrawalData)
      .select()
      .single()
    return { data, error }
  },

  getWithdrawalRequests: async (memberId = null, status = null) => {
    let query = supabase
      .from('member_withdrawals')
      .select('*, members(full_name, email)')
      .order('requested_at', { ascending: false })

    if (memberId) {
      query = query.eq('member_id', memberId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query
    return { data, error }
  },

  updateWithdrawalRequest: async (id, updates) => {
    const { data, error } = await supabase
      .from('member_withdrawals')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  approveWithdrawal: async (id) => {
    const { data, error } = await supabase
      .from('member_withdrawals')
      .update({ status: 'approved', updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  rejectWithdrawal: async (id, reason) => {
    const { data, error } = await supabase
      .from('member_withdrawals')
      .update({
        status: 'rejected',
        admin_notes: reason,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  completeWithdrawal: async (id) => {
    const { data, error } = await supabase
      .from('member_withdrawals')
      .update({
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  // Settings
  getQuotaSettings: async () => {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .in('key', ['required_loan_interest_quota', 'withdrawal_waiting_period_days', 'enable_quota_based_dividends'])
    return { data, error }
  },

  updateQuotaSetting: async (key, value) => {
    const { data, error } = await supabase
      .from('settings')
      .update({ value })
      .eq('key', key)
      .select()
      .single()
    return { data, error }
  }
}

