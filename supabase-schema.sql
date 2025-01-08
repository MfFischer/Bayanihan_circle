-- Bayanihan Savings Circle Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Members Table
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    role TEXT DEFAULT 'member' CHECK (role IN ('member', 'admin')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contributions Table
CREATE TABLE contributions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    contribution_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method TEXT DEFAULT 'cash' CHECK (payment_method IN ('cash', 'bank_transfer', 'gcash', 'paymaya')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Loans Table
CREATE TABLE loans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    interest_rate DECIMAL(5, 2) NOT NULL DEFAULT 2.0,
    term_months INTEGER NOT NULL,
    purpose TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'active', 'paid', 'defaulted', 'rejected')),
    approved_by UUID REFERENCES members(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    disbursed_at TIMESTAMP WITH TIME ZONE,
    due_date DATE,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Loan Payments Table
CREATE TABLE loan_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    loan_id UUID REFERENCES loans(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method TEXT DEFAULT 'cash',
    is_late BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Points Table
CREATE TABLE points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    points INTEGER NOT NULL,
    reason TEXT NOT NULL,
    reference_type TEXT CHECK (reference_type IN ('contribution', 'loan', 'payment', 'loan_payment', 'penalty', 'bonus', 'manual')),
    reference_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions Table (General ledger)
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('contribution', 'loan_disbursement', 'loan_payment', 'dividend', 'withdrawal', 'fee')),
    amount DECIMAL(10, 2) NOT NULL,
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT,
    reference_type TEXT,
    reference_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dividends Table
CREATE TABLE dividends (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    total_points INTEGER NOT NULL,
    dividend_amount DECIMAL(10, 2) NOT NULL,
    total_payout DECIMAL(10, 2) NOT NULL,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Settings Table (for system configuration)
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_members_user_id ON members(user_id);
CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_contributions_member_id ON contributions(member_id);
CREATE INDEX idx_contributions_date ON contributions(contribution_date);
CREATE INDEX idx_loans_member_id ON loans(member_id);
CREATE INDEX idx_loans_status ON loans(status);
CREATE INDEX idx_points_member_id ON points(member_id);
CREATE INDEX idx_transactions_member_id ON transactions(member_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contributions_updated_at BEFORE UPDATE ON contributions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loans_updated_at BEFORE UPDATE ON loans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE points ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE dividends ENABLE ROW LEVEL SECURITY;

-- Members policies
CREATE POLICY "Users can view their own member record"
    ON members FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all members"
    ON members FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM members
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update members"
    ON members FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM members
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Contributions policies
CREATE POLICY "Users can view their own contributions"
    ON contributions FOR SELECT
    USING (
        member_id IN (
            SELECT id FROM members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all contributions"
    ON contributions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM members
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Users can insert their own contributions"
    ON contributions FOR INSERT
    WITH CHECK (
        member_id IN (
            SELECT id FROM members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all contributions"
    ON contributions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM members
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Loans policies
CREATE POLICY "Users can view their own loans"
    ON loans FOR SELECT
    USING (
        member_id IN (
            SELECT id FROM members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all loans"
    ON loans FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM members
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Users can create loan applications"
    ON loans FOR INSERT
    WITH CHECK (
        member_id IN (
            SELECT id FROM members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all loans"
    ON loans FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM members
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Points policies
CREATE POLICY "Users can view their own points"
    ON points FOR SELECT
    USING (
        member_id IN (
            SELECT id FROM members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all points"
    ON points FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM members
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can manage points"
    ON points FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM members
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Transactions policies (similar pattern)
CREATE POLICY "Users can view their own transactions"
    ON transactions FOR SELECT
    USING (
        member_id IN (
            SELECT id FROM members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all transactions"
    ON transactions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM members
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Insert default settings
INSERT INTO settings (key, value, description) VALUES
    ('point_rules', '{"contribution_per_100": 1, "participation_bonus": 100, "on_time_payment": 50, "perfect_attendance": 20, "early_payment": 25, "no_borrow_penalty": -100, "late_payment": -50, "missed_contribution": -25, "defaulted_loan": -200}', 'Point calculation rules'),
    ('interest_rate', '{"default": 2.0, "min": 1.0, "max": 5.0}', 'Loan interest rates (monthly)'),
    ('contribution_amount', '{"standard": 1000, "min": 100}', 'Contribution amounts'),
    ('loan_limits', '{"min": 1000, "max": 50000}', 'Loan amount limits');

