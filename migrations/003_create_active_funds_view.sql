-- ============================================
-- CREATE ACTIVE FUNDS VIEW
-- ============================================
-- This view calculates the current active funds available
-- by summing contributions and subtracting active loans

-- Drop existing view if it exists
DROP VIEW IF EXISTS v_active_funds CASCADE;

-- Create the v_active_funds view
CREATE VIEW v_active_funds AS
SELECT
  -- Total contributions collected (approved only)
  COALESCE(SUM(CASE 
    WHEN c.status = 'approved' THEN c.amount 
    ELSE 0 
  END), 0)::DECIMAL(10, 2) AS total_collected,
  
  -- Total active loans (sum of remaining balance)
  COALESCE(SUM(CASE 
    WHEN l.status = 'active' THEN COALESCE(l.balance, l.amount) 
    ELSE 0 
  END), 0)::DECIMAL(10, 2) AS total_active_loans,
  
  -- Active funds = total collected - total active loans
  (COALESCE(SUM(CASE 
    WHEN c.status = 'approved' THEN c.amount 
    ELSE 0 
  END), 0) - COALESCE(SUM(CASE 
    WHEN l.status = 'active' THEN COALESCE(l.balance, l.amount) 
    ELSE 0 
  END), 0))::DECIMAL(10, 2) AS active_funds,
  
  -- Available for new loans (same as active funds)
  (COALESCE(SUM(CASE 
    WHEN c.status = 'approved' THEN c.amount 
    ELSE 0 
  END), 0) - COALESCE(SUM(CASE 
    WHEN l.status = 'active' THEN COALESCE(l.balance, l.amount) 
    ELSE 0 
  END), 0))::DECIMAL(10, 2) AS available_for_new_loans
  
FROM contributions c
FULL OUTER JOIN loans l ON 1=1
WHERE c.group_id = (SELECT id FROM groups ORDER BY created_at LIMIT 1)
  OR l.group_id = (SELECT id FROM groups ORDER BY created_at LIMIT 1);

-- Grant permissions
GRANT SELECT ON v_active_funds TO authenticated;
GRANT SELECT ON v_active_funds TO anon;

