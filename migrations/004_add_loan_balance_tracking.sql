-- ============================================
-- ADD LOAN BALANCE TRACKING
-- ============================================
-- This migration adds balance tracking to loans
-- and creates a trigger to update balance when payments are made

-- Step 1: Add balance column to loans table if it doesn't exist
ALTER TABLE loans
ADD COLUMN IF NOT EXISTS balance DECIMAL(10, 2);

-- Step 2: Initialize balance for existing loans
UPDATE loans
SET balance = amount
WHERE balance IS NULL;

-- Step 3: Create function to update loan balance when payment is made
CREATE OR REPLACE FUNCTION update_loan_balance_on_payment()
RETURNS TRIGGER AS $$
DECLARE
  v_total_paid DECIMAL(10, 2);
  v_loan_amount DECIMAL(10, 2);
BEGIN
  -- Get the loan amount
  SELECT amount INTO v_loan_amount
  FROM loans
  WHERE id = NEW.loan_id;
  
  -- Calculate total paid for this loan
  SELECT COALESCE(SUM(amount), 0) INTO v_total_paid
  FROM loan_payments
  WHERE loan_id = NEW.loan_id;
  
  -- Update the loan balance
  UPDATE loans
  SET balance = v_loan_amount - v_total_paid,
      updated_at = NOW()
  WHERE id = NEW.loan_id;
  
  -- If balance is 0 or less, mark loan as paid
  IF (v_loan_amount - v_total_paid) <= 0 THEN
    UPDATE loans
    SET status = 'paid',
        paid_at = NOW(),
        updated_at = NOW()
    WHERE id = NEW.loan_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Create trigger to call the function
DROP TRIGGER IF EXISTS update_loan_balance_trigger ON loan_payments;
CREATE TRIGGER update_loan_balance_trigger
AFTER INSERT ON loan_payments
FOR EACH ROW
EXECUTE FUNCTION update_loan_balance_on_payment();

-- Step 5: Update existing loan balances based on payments already made
UPDATE loans l
SET balance = l.amount - COALESCE((
  SELECT SUM(amount)
  FROM loan_payments
  WHERE loan_id = l.id
), 0)
WHERE l.status = 'active' OR l.status = 'paid';

