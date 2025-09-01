-- Create accounts and transactions tables for comprehensive financial tracking

-- Account types table for categorization
CREATE TABLE IF NOT EXISTS account_types (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default account types
INSERT INTO account_types (name, description, icon) VALUES
    ('cash', 'Physical cash and cash equivalents', 'Banknote'),
    ('checking', 'Bank checking account', 'CreditCard'),
    ('savings', 'Bank savings account', 'PiggyBank'),
    ('credit_card', 'Credit card account', 'CreditCard'),
    ('investment', 'Investment and brokerage accounts', 'TrendingUp'),
    ('crypto', 'Cryptocurrency wallets', 'Bitcoin'),
    ('other', 'Other financial accounts', 'Wallet')
ON CONFLICT (name) DO NOTHING;

-- Accounts table for managing different financial accounts
CREATE TABLE IF NOT EXISTS accounts (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    account_type_id INTEGER NOT NULL REFERENCES account_types(id),
    balance DECIMAL(15,2) NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transaction categories table
CREATE TABLE IF NOT EXISTS transaction_categories (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    color TEXT,
    is_income BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default transaction categories
INSERT INTO transaction_categories (name, description, icon, color, is_income) VALUES
    -- Income categories
    ('salary', 'Regular salary and wages', 'DollarSign', 'green', true),
    ('freelance', 'Freelance work and side income', 'Briefcase', 'green', true),
    ('investment_income', 'Dividends, interest, and investment returns', 'TrendingUp', 'green', true),
    ('gift', 'Gifts and monetary presents', 'Gift', 'green', true),
    ('other_income', 'Other income sources', 'Plus', 'green', true),
    
    -- Expense categories
    ('food', 'Food and dining expenses', 'Utensils', 'red', false),
    ('transport', 'Transportation and fuel', 'Car', 'red', false),
    ('housing', 'Rent, mortgage, and utilities', 'Home', 'red', false),
    ('healthcare', 'Medical and health expenses', 'Heart', 'red', false),
    ('entertainment', 'Entertainment and leisure', 'Tv', 'red', false),
    ('shopping', 'Shopping and personal purchases', 'ShoppingBag', 'red', false),
    ('education', 'Education and learning expenses', 'BookOpen', 'red', false),
    ('insurance', 'Insurance premiums and fees', 'Shield', 'red', false),
    ('utilities', 'Electricity, water, internet, phone', 'Zap', 'red', false),
    ('debt_payment', 'Loan and debt payments', 'CreditCard', 'red', false),
    ('savings_transfer', 'Transfers to savings accounts', 'PiggyBank', 'blue', false),
    ('investment', 'Investment purchases', 'TrendingUp', 'blue', false),
    ('other_expense', 'Other miscellaneous expenses', 'Minus', 'red', false)
ON CONFLICT (name) DO NOTHING;

-- Transactions table for recording all financial transactions
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    account_id INTEGER NOT NULL REFERENCES accounts(id),
    category_id INTEGER NOT NULL REFERENCES transaction_categories(id),
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    transaction_date TIMESTAMP WITH TIME ZONE NOT NULL,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_frequency TEXT CHECK (recurring_frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
    recurring_end_date TIMESTAMP WITH TIME ZONE,
    tags TEXT[], -- Array of tags for better organization
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transfers table for recording money transfers between accounts
CREATE TABLE IF NOT EXISTS transfers (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    from_account_id INTEGER NOT NULL REFERENCES accounts(id),
    to_account_id INTEGER NOT NULL REFERENCES accounts(id),
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    transfer_date TIMESTAMP WITH TIME ZONE NOT NULL,
    fee DECIMAL(15,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_user_active ON accounts(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_accounts_type ON accounts(account_type_id);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_user_account ON transactions(user_id, account_id);

CREATE INDEX IF NOT EXISTS idx_transfers_user_id ON transfers(user_id);
CREATE INDEX IF NOT EXISTS idx_transfers_from_account ON transfers(from_account_id);
CREATE INDEX IF NOT EXISTS idx_transfers_to_account ON transfers(to_account_id);
CREATE INDEX IF NOT EXISTS idx_transfers_date ON transfers(transfer_date);

-- Create triggers to automatically update account balances
CREATE OR REPLACE FUNCTION update_account_balance()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- For income categories, add to balance; for expenses, subtract
        IF EXISTS (SELECT 1 FROM transaction_categories WHERE id = NEW.category_id AND is_income = true) THEN
            UPDATE accounts SET balance = balance + NEW.amount WHERE id = NEW.account_id;
        ELSE
            UPDATE accounts SET balance = balance - NEW.amount WHERE id = NEW.account_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Reverse the transaction
        IF EXISTS (SELECT 1 FROM transaction_categories WHERE id = OLD.category_id AND is_income = true) THEN
            UPDATE accounts SET balance = balance - OLD.amount WHERE id = OLD.account_id;
        ELSE
            UPDATE accounts SET balance = balance + OLD.amount WHERE id = OLD.account_id;
        END IF;
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Reverse old transaction and apply new one
        IF EXISTS (SELECT 1 FROM transaction_categories WHERE id = OLD.category_id AND is_income = true) THEN
            UPDATE accounts SET balance = balance - OLD.amount WHERE id = OLD.account_id;
        ELSE
            UPDATE accounts SET balance = balance + OLD.amount WHERE id = OLD.account_id;
        END IF;
        
        IF EXISTS (SELECT 1 FROM transaction_categories WHERE id = NEW.category_id AND is_income = true) THEN
            UPDATE accounts SET balance = balance + NEW.amount WHERE id = NEW.account_id;
        ELSE
            UPDATE accounts SET balance = balance - NEW.amount WHERE id = NEW.account_id;
        END IF;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for transactions
CREATE TRIGGER transaction_balance_trigger
    AFTER INSERT OR UPDATE OR DELETE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_account_balance();

-- Create function to handle transfers
CREATE OR REPLACE FUNCTION process_transfer()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Subtract from source account (including fee)
        UPDATE accounts SET balance = balance - (NEW.amount + NEW.fee) WHERE id = NEW.from_account_id;
        -- Add to destination account
        UPDATE accounts SET balance = balance + NEW.amount WHERE id = NEW.to_account_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Reverse the transfer
        UPDATE accounts SET balance = balance + (OLD.amount + OLD.fee) WHERE id = OLD.from_account_id;
        UPDATE accounts SET balance = balance - OLD.amount WHERE id = OLD.to_account_id;
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Reverse old transfer
        UPDATE accounts SET balance = balance + (OLD.amount + OLD.fee) WHERE id = OLD.from_account_id;
        UPDATE accounts SET balance = balance - OLD.amount WHERE id = OLD.to_account_id;
        -- Apply new transfer
        UPDATE accounts SET balance = balance - (NEW.amount + NEW.fee) WHERE id = NEW.from_account_id;
        UPDATE accounts SET balance = balance + NEW.amount WHERE id = NEW.to_account_id;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for transfers
CREATE TRIGGER transfer_balance_trigger
    AFTER INSERT OR UPDATE OR DELETE ON transfers
    FOR EACH ROW EXECUTE FUNCTION process_transfer();
