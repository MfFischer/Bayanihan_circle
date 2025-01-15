-- Migration: Quota-Based Dividend System
-- Description: Replace points-based system with quota-based dividend calculation
-- Date: 2025-11-03

-- ============================================================================
-- PHASE 1: CREATE NEW TABLES FOR QUOTA-BASED SYSTEM
-- ============================================================================

-- 1. Member Interest Tracking Table
-- Tracks total interest paid by each member per year
CREATE TABLE IF NOT EXISTS member_interest_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  total_interest_paid DECIMAL(10, 2) DEFAULT 0,
  quota_met BOOLEAN DEFAULT false,
  dividend_amount DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(member_id, year)
);

-- 2. Member Withdrawals Table
-- Tracks withdrawal requests with eligibility checks
CREATE TABLE IF NOT EXISTS member_withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  withdrawal_amount DECIMAL(10, 2) NOT NULL,
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  eligible_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'completed', 'rejected', 'cancelled')),
  has_active_loans BOOLEAN DEFAULT false,
  has_pending_contributions BOOLEAN DEFAULT false,
  share_capital DECIMAL(10, 2) DEFAULT 0,
  dividend_earned DECIMAL(10, 2) DEFAULT 0,
  reason TEXT,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Year-End Distribution Table
-- Stores year-end distribution calculations and results
CREATE TABLE IF NOT EXISTS year_end_distribution (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INTEGER NOT NULL,
  total_interest_earned DECIMAL(10, 2) NOT NULL,
  quota_members_count INTEGER NOT NULL,
  full_dividend_amount DECIMAL(10, 2) NOT NULL,
  total_distributed DECIMAL(10, 2) NOT NULL,
  distributed_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'distributed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(year)
);

-- ============================================================================
-- PHASE 2: UPDATE EXISTING TABLES
-- ============================================================================

-- Add quota-based columns to group_settings table if not exists
ALTER TABLE group_settings ADD COLUMN IF NOT EXISTS
  required_loan_interest_quota DECIMAL(10, 2) DEFAULT 5000;

ALTER TABLE group_settings ADD COLUMN IF NOT EXISTS
  withdrawal_waiting_period_days INTEGER DEFAULT 30;

ALTER TABLE group_settings ADD COLUMN IF NOT EXISTS
  enable_quota_based_dividends BOOLEAN DEFAULT true;

-- ============================================================================
-- PHASE 3: CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_member_interest_tracking_member_id 
  ON member_interest_tracking(member_id);
CREATE INDEX IF NOT EXISTS idx_member_interest_tracking_year 
  ON member_interest_tracking(year);
CREATE INDEX IF NOT EXISTS idx_member_withdrawals_member_id 
  ON member_withdrawals(member_id);
CREATE INDEX IF NOT EXISTS idx_member_withdrawals_status 
  ON member_withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_year_end_distribution_year 
  ON year_end_distribution(year);

-- ============================================================================
-- PHASE 4: CREATE TRIGGER FUNCTIONS
-- ============================================================================

-- Function: Update member interest tracking when loan payment is recorded
CREATE OR REPLACE FUNCTION update_member_interest_tracking()
RETURNS TRIGGER AS $$
DECLARE
  v_member_id UUID;
  v_year INTEGER;
  v_total_interest DECIMAL;
  v_required_quota DECIMAL;
  v_quota_met BOOLEAN;
BEGIN
  -- Get member_id from loan
  SELECT member_id INTO v_member_id
  FROM loans WHERE id = NEW.loan_id;
  
  v_year := EXTRACT(YEAR FROM NEW.payment_date);
  
  -- Get required quota from settings
  SELECT (value::NUMERIC) INTO v_required_quota
  FROM settings WHERE key = 'required_loan_interest_quota';
  
  IF v_required_quota IS NULL THEN
    v_required_quota := 5000;
  END IF;
  
  -- Calculate total interest paid by member in this year
  SELECT COALESCE(SUM(amount), 0) INTO v_total_interest
  FROM loan_payments
  WHERE loan_id IN (
    SELECT id FROM loans WHERE member_id = v_member_id
  )
  AND EXTRACT(YEAR FROM payment_date) = v_year;
  
  -- Determine if quota is met
  v_quota_met := v_total_interest >= v_required_quota;
  
  -- Update or insert tracking record
  INSERT INTO member_interest_tracking 
    (member_id, year, total_interest_paid, quota_met)
  VALUES (v_member_id, v_year, v_total_interest, v_quota_met)
  ON CONFLICT (member_id, year) 
  DO UPDATE SET 
    total_interest_paid = v_total_interest,
    quota_met = v_quota_met,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Update interest tracking on loan payment
DROP TRIGGER IF EXISTS trigger_update_interest_tracking ON loan_payments;
CREATE TRIGGER trigger_update_interest_tracking
AFTER INSERT ON loan_payments
FOR EACH ROW
EXECUTE FUNCTION update_member_interest_tracking();

-- ============================================================================
-- PHASE 5: CREATE UTILITY FUNCTIONS
-- ============================================================================

-- Function: Calculate year-end distribution
CREATE OR REPLACE FUNCTION calculate_year_end_distribution(p_year INTEGER)
RETURNS TABLE (
  member_id UUID,
  share_capital DECIMAL,
  interest_paid DECIMAL,
  quota_met BOOLEAN,
  dividend_amount DECIMAL,
  total_payout DECIMAL
) AS $$
DECLARE
  v_required_quota DECIMAL;
  v_total_interest DECIMAL;
  v_quota_members_count INTEGER;
  v_full_dividend DECIMAL;
BEGIN
  -- Get quota from settings
  SELECT (value::NUMERIC) INTO v_required_quota
  FROM settings WHERE key = 'required_loan_interest_quota';
  
  IF v_required_quota IS NULL THEN
    v_required_quota := 5000;
  END IF;
  
  -- Calculate total interest earned
  SELECT COALESCE(SUM(amount), 0) INTO v_total_interest
  FROM loan_payments
  WHERE EXTRACT(YEAR FROM payment_date) = p_year;
  
  -- Count quota members
  SELECT COUNT(*) INTO v_quota_members_count
  FROM member_interest_tracking
  WHERE year = p_year
  AND quota_met = true;
  
  -- Calculate full dividend
  IF v_quota_members_count > 0 THEN
    v_full_dividend := v_total_interest / v_quota_members_count;
  ELSE
    v_full_dividend := 0;
  END IF;
  
  -- Return results for each member
  RETURN QUERY
  SELECT 
    m.id,
    COALESCE(SUM(c.amount), 0)::DECIMAL,
    COALESCE(mit.total_interest_paid, 0),
    COALESCE(mit.quota_met, false),
    CASE 
      WHEN COALESCE(mit.quota_met, false) = true THEN v_full_dividend
      WHEN COALESCE(mit.total_interest_paid, 0) > 0 THEN 
        (COALESCE(mit.total_interest_paid, 0) / v_required_quota) * v_full_dividend
      ELSE 0
    END,
    COALESCE(SUM(c.amount), 0)::DECIMAL + CASE 
      WHEN COALESCE(mit.quota_met, false) = true THEN v_full_dividend
      WHEN COALESCE(mit.total_interest_paid, 0) > 0 THEN 
        (COALESCE(mit.total_interest_paid, 0) / v_required_quota) * v_full_dividend
      ELSE 0
    END
  FROM members m
  LEFT JOIN contributions c ON m.id = c.member_id AND c.status = 'confirmed'
  LEFT JOIN member_interest_tracking mit ON m.id = mit.member_id AND mit.year = p_year
  GROUP BY m.id, mit.total_interest_paid, mit.quota_met;
END;
$$ LANGUAGE plpgsql;

-- Function: Check withdrawal eligibility
CREATE OR REPLACE FUNCTION check_withdrawal_eligibility(p_member_id UUID)
RETURNS TABLE (
  eligible BOOLEAN,
  reason TEXT,
  eligible_at TIMESTAMP WITH TIME ZONE,
  has_active_loans BOOLEAN,
  has_pending_contributions BOOLEAN
) AS $$
DECLARE
  v_waiting_period INTEGER;
  v_last_contribution_date TIMESTAMP WITH TIME ZONE;
  v_eligible_at TIMESTAMP WITH TIME ZONE;
  v_has_active_loans BOOLEAN;
  v_has_pending_contributions BOOLEAN;
BEGIN
  -- Get waiting period from settings
  SELECT (value::NUMERIC)::INTEGER INTO v_waiting_period
  FROM settings WHERE key = 'withdrawal_waiting_period_days';
  
  IF v_waiting_period IS NULL THEN
    v_waiting_period := 30;
  END IF;
  
  -- Get last contribution date
  SELECT MAX(created_at) INTO v_last_contribution_date
  FROM contributions
  WHERE member_id = p_member_id AND status = 'confirmed';
  
  -- Calculate eligible date
  v_eligible_at := v_last_contribution_date + (v_waiting_period || ' days')::INTERVAL;
  
  -- Check for active loans
  SELECT EXISTS(
    SELECT 1 FROM loans 
    WHERE member_id = p_member_id AND status = 'active'
  ) INTO v_has_active_loans;
  
  -- Check for pending contributions
  SELECT EXISTS(
    SELECT 1 FROM contributions 
    WHERE member_id = p_member_id AND status = 'pending'
  ) INTO v_has_pending_contributions;
  
  -- Check eligibility
  RETURN QUERY SELECT 
    (NOW() >= v_eligible_at AND NOT v_has_active_loans AND NOT v_has_pending_contributions),
    CASE 
      WHEN v_has_active_loans THEN 'Member has active loans'
      WHEN v_has_pending_contributions THEN 'Member has pending contributions'
      WHEN NOW() < v_eligible_at THEN 'Member must wait until ' || v_eligible_at::TEXT
      ELSE 'Member is eligible for withdrawal'
    END,
    v_eligible_at,
    v_has_active_loans,
    v_has_pending_contributions;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PHASE 6: ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE member_interest_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE year_end_distribution ENABLE ROW LEVEL SECURITY;

-- RLS Policies for member_interest_tracking
CREATE POLICY "Users can view their own interest tracking"
  ON member_interest_tracking FOR SELECT
  USING (member_id IN (SELECT id FROM members WHERE user_id = auth.uid()));

CREATE POLICY "Admins can view all interest tracking"
  ON member_interest_tracking FOR SELECT
  USING (EXISTS (SELECT 1 FROM members WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage interest tracking"
  ON member_interest_tracking FOR ALL
  USING (EXISTS (SELECT 1 FROM members WHERE user_id = auth.uid() AND role = 'admin'));

-- RLS Policies for member_withdrawals
CREATE POLICY "Users can view their own withdrawals"
  ON member_withdrawals FOR SELECT
  USING (member_id IN (SELECT id FROM members WHERE user_id = auth.uid()));

CREATE POLICY "Admins can view all withdrawals"
  ON member_withdrawals FOR SELECT
  USING (EXISTS (SELECT 1 FROM members WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can create withdrawal requests"
  ON member_withdrawals FOR INSERT
  WITH CHECK (member_id IN (SELECT id FROM members WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage withdrawals"
  ON member_withdrawals FOR ALL
  USING (EXISTS (SELECT 1 FROM members WHERE user_id = auth.uid() AND role = 'admin'));

-- RLS Policies for year_end_distribution
CREATE POLICY "Users can view distributions"
  ON year_end_distribution FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage distributions"
  ON year_end_distribution FOR ALL
  USING (EXISTS (SELECT 1 FROM members WHERE user_id = auth.uid() AND role = 'admin'));

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- Run this migration in Supabase SQL Editor
-- All new tables, functions, and policies are now in place

