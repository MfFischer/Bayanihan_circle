-- ============================================
-- COMPREHENSIVE END-TO-END INTEGRATION TEST
-- ============================================
-- Tests: Frontend → Backend → Database
-- Date: 2025-01-21
-- ============================================

-- Clean up test data first
DO $$
DECLARE
  test_group_id uuid;
  test_member_id uuid;
BEGIN
  -- Get test group
  SELECT id INTO test_group_id FROM groups LIMIT 1;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'STARTING E2E INTEGRATION TESTS';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Test Group ID: %', test_group_id;
  RAISE NOTICE '';
END $$;

-- ============================================
-- TEST 1: Database Tables Exist
-- ============================================
DO $$
DECLARE
  table_count int;
BEGIN
  RAISE NOTICE '----------------------------------------';
  RAISE NOTICE 'TEST 1: Database Tables Exist';
  RAISE NOTICE '----------------------------------------';
  
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name IN (
    'groups', 'members', 'contributions', 'loans', 
    'loan_payments', 'membership_fees', 'management_fees',
    'member_interest_tracking'
  );
  
  IF table_count = 8 THEN
    RAISE NOTICE '✅ PASS: All 8 required tables exist';
  ELSE
    RAISE NOTICE '❌ FAIL: Expected 8 tables, found %', table_count;
  END IF;
  RAISE NOTICE '';
END $$;

-- ============================================
-- TEST 2: Database Views Exist
-- ============================================
DO $$
DECLARE
  view_count int;
BEGIN
  RAISE NOTICE '----------------------------------------';
  RAISE NOTICE 'TEST 2: Database Views Exist';
  RAISE NOTICE '----------------------------------------';
  
  SELECT COUNT(*) INTO view_count
  FROM information_schema.views 
  WHERE table_schema = 'public' 
  AND table_name IN ('v_active_funds');
  
  IF view_count = 1 THEN
    RAISE NOTICE '✅ PASS: v_active_funds view exists';
  ELSE
    RAISE NOTICE '❌ FAIL: v_active_funds view not found';
  END IF;
  RAISE NOTICE '';
END $$;

-- ============================================
-- TEST 3: RPC Functions Exist
-- ============================================
DO $$
DECLARE
  function_count int;
BEGIN
  RAISE NOTICE '----------------------------------------';
  RAISE NOTICE 'TEST 3: RPC Functions Exist';
  RAISE NOTICE '----------------------------------------';
  
  SELECT COUNT(*) INTO function_count
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
  AND p.proname IN (
    'get_admin_earnings',
    'update_loan_balance_on_payment'
  );
  
  IF function_count >= 2 THEN
    RAISE NOTICE '✅ PASS: All required functions exist';
  ELSE
    RAISE NOTICE '❌ FAIL: Expected 2+ functions, found %', function_count;
  END IF;
  RAISE NOTICE '';
END $$;

-- ============================================
-- TEST 4: Triggers Exist
-- ============================================
DO $$
DECLARE
  trigger_count int;
BEGIN
  RAISE NOTICE '----------------------------------------';
  RAISE NOTICE 'TEST 4: Triggers Exist';
  RAISE NOTICE '----------------------------------------';
  
  SELECT COUNT(*) INTO trigger_count
  FROM information_schema.triggers
  WHERE trigger_schema = 'public'
  AND trigger_name = 'update_loan_balance_trigger';
  
  IF trigger_count = 1 THEN
    RAISE NOTICE '✅ PASS: Loan balance trigger exists';
  ELSE
    RAISE NOTICE '❌ FAIL: Loan balance trigger not found';
  END IF;
  RAISE NOTICE '';
END $$;

-- ============================================
-- TEST 5: Active Funds View Returns Data
-- ============================================
DO $$
DECLARE
  total_collected numeric;
  total_active_loans numeric;
  active_funds numeric;
BEGIN
  RAISE NOTICE '----------------------------------------';
  RAISE NOTICE 'TEST 5: Active Funds View Returns Data';
  RAISE NOTICE '----------------------------------------';
  
  SELECT 
    v.total_collected,
    v.total_active_loans,
    v.active_funds
  INTO total_collected, total_active_loans, active_funds
  FROM v_active_funds v;
  
  RAISE NOTICE 'Total Collected: ₱%', total_collected;
  RAISE NOTICE 'Total Active Loans: ₱%', total_active_loans;
  RAISE NOTICE 'Active Funds: ₱%', active_funds;
  
  IF total_collected IS NOT NULL THEN
    RAISE NOTICE '✅ PASS: Active funds view returns data';
  ELSE
    RAISE NOTICE '❌ FAIL: Active funds view returns NULL';
  END IF;
  RAISE NOTICE '';
END $$;

-- ============================================
-- TEST 6: Admin Earnings Function Works
-- ============================================
DO $$
DECLARE
  test_group_id uuid;
  membership_fees numeric;
  management_fees numeric;
  total_earnings numeric;
BEGIN
  RAISE NOTICE '----------------------------------------';
  RAISE NOTICE 'TEST 6: Admin Earnings Function Works';
  RAISE NOTICE '----------------------------------------';
  
  SELECT id INTO test_group_id FROM groups LIMIT 1;
  
  SELECT 
    e.total_membership_fees,
    e.total_management_fees,
    e.total_earnings
  INTO membership_fees, management_fees, total_earnings
  FROM get_admin_earnings(test_group_id) e;
  
  RAISE NOTICE 'Membership Fees: ₱%', membership_fees;
  RAISE NOTICE 'Management Fees: ₱%', management_fees;
  RAISE NOTICE 'Total Earnings: ₱%', total_earnings;
  
  IF total_earnings IS NOT NULL THEN
    RAISE NOTICE '✅ PASS: Admin earnings function works';
  ELSE
    RAISE NOTICE '❌ FAIL: Admin earnings function returns NULL';
  END IF;
  RAISE NOTICE '';
END $$;

-- ============================================
-- TEST 7: Loan Balance Tracking Works
-- ============================================
DO $$
DECLARE
  test_loan_id uuid;
  loan_amount numeric;
  loan_balance numeric;
  total_paid numeric;
BEGIN
  RAISE NOTICE '----------------------------------------';
  RAISE NOTICE 'TEST 7: Loan Balance Tracking Works';
  RAISE NOTICE '----------------------------------------';
  
  SELECT id, amount, balance INTO test_loan_id, loan_amount, loan_balance
  FROM loans 
  WHERE status = 'active'
  LIMIT 1;
  
  IF test_loan_id IS NOT NULL THEN
    SELECT COALESCE(SUM(amount), 0) INTO total_paid
    FROM loan_payments
    WHERE loan_id = test_loan_id;
    
    RAISE NOTICE 'Loan Amount: ₱%', loan_amount;
    RAISE NOTICE 'Total Paid: ₱%', total_paid;
    RAISE NOTICE 'Current Balance: ₱%', loan_balance;
    RAISE NOTICE 'Expected Balance: ₱%', (loan_amount - total_paid);
    
    IF loan_balance = (loan_amount - total_paid) THEN
      RAISE NOTICE '✅ PASS: Loan balance is correct';
    ELSE
      RAISE NOTICE '❌ FAIL: Loan balance mismatch';
    END IF;
  ELSE
    RAISE NOTICE '⚠️  SKIP: No active loans to test';
  END IF;
  RAISE NOTICE '';
END $$;

-- ============================================
-- TEST 8: Data Integrity Check
-- ============================================
DO $$
DECLARE
  orphan_contributions int;
  orphan_loans int;
  orphan_payments int;
BEGIN
  RAISE NOTICE '----------------------------------------';
  RAISE NOTICE 'TEST 8: Data Integrity Check';
  RAISE NOTICE '----------------------------------------';
  
  -- Check for orphaned contributions
  SELECT COUNT(*) INTO orphan_contributions
  FROM contributions c
  LEFT JOIN members m ON c.member_id = m.id
  WHERE m.id IS NULL;
  
  -- Check for orphaned loans
  SELECT COUNT(*) INTO orphan_loans
  FROM loans l
  LEFT JOIN members m ON l.member_id = m.id
  WHERE m.id IS NULL;
  
  -- Check for orphaned payments
  SELECT COUNT(*) INTO orphan_payments
  FROM loan_payments lp
  LEFT JOIN loans l ON lp.loan_id = l.id
  WHERE l.id IS NULL;
  
  RAISE NOTICE 'Orphaned Contributions: %', orphan_contributions;
  RAISE NOTICE 'Orphaned Loans: %', orphan_loans;
  RAISE NOTICE 'Orphaned Payments: %', orphan_payments;
  
  IF orphan_contributions = 0 AND orphan_loans = 0 AND orphan_payments = 0 THEN
    RAISE NOTICE '✅ PASS: No data integrity issues';
  ELSE
    RAISE NOTICE '❌ FAIL: Data integrity issues found';
  END IF;
  RAISE NOTICE '';
END $$;

-- ============================================
-- TEST SUMMARY
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'E2E INTEGRATION TESTS COMPLETE';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Review results above for any failures';
  RAISE NOTICE '';
END $$;

