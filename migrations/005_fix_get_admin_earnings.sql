-- Fix get_admin_earnings function to properly join with members table
-- Issue: Function was trying to filter by group_id directly on membership_fees and management_fees tables
-- Solution: Join with members table to get group_id

CREATE OR REPLACE FUNCTION get_admin_earnings(p_group_id uuid)
RETURNS TABLE(total_membership_fees numeric, total_management_fees numeric, total_earnings numeric)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(CASE WHEN mf.fee_type = 'membership' THEN mf.fee_amount ELSE 0 END), 0)::numeric as total_membership_fees,
    COALESCE(SUM(CASE WHEN mf.fee_type = 'management' THEN mf.fee_amount ELSE 0 END), 0)::numeric as total_management_fees,
    COALESCE(SUM(mf.fee_amount), 0)::numeric as total_earnings
  FROM (
    -- Get membership fees by joining with members table
    SELECT 'membership' as fee_type, mf.amount as fee_amount 
    FROM membership_fees mf
    INNER JOIN members m ON mf.member_id = m.id
    WHERE m.group_id = p_group_id
    
    UNION ALL
    
    -- Get management fees (admin_share) by joining with members table
    SELECT 'management' as fee_type, mgf.admin_share as fee_amount 
    FROM management_fees mgf
    INNER JOIN members m ON mgf.member_id = m.id
    WHERE m.group_id = p_group_id
  ) mf;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_admin_earnings(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_admin_earnings(uuid) TO anon;

