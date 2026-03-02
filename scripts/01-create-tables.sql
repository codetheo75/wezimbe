-- Wezimbe Database Schema
-- Core tables for fintech + community savings app

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users table (extended Supabase auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone_number TEXT,
  profile_picture_url TEXT,
  date_of_birth DATE,
  country TEXT,
  state_province TEXT,
  address TEXT,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  kyc_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Groups table (community savings circles)
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  group_type TEXT NOT NULL CHECK (group_type IN ('savings', 'investment', 'mixed')) DEFAULT 'savings',
  currency TEXT DEFAULT 'NGN',
  contribution_frequency TEXT CHECK (contribution_frequency IN ('daily', 'weekly', 'monthly', 'quarterly')),
  target_amount DECIMAL(15, 2),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'archived')),
  max_members INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Group Members table
CREATE TABLE IF NOT EXISTS group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'treasurer', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  total_contributed DECIMAL(15, 2) DEFAULT 0,
  UNIQUE(group_id, user_id)
);

-- 4. Contributions table (individual contributions to groups)
CREATE TABLE IF NOT EXISTS contributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(15, 2) NOT NULL,
  contribution_type TEXT CHECK (contribution_type IN ('regular', 'penalty', 'adjustment')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
  scheduled_date DATE,
  actual_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Assets table (shared assets purchased by groups)
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  asset_type TEXT CHECK (asset_type IN ('property', 'vehicle', 'equipment', 'crypto', 'stocks', 'other')),
  purchase_price DECIMAL(15, 2) NOT NULL,
  current_value DECIMAL(15, 2),
  purchase_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'depreciated')),
  documentation_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Asset Ownership table (tracks ownership percentages)
CREATE TABLE IF NOT EXISTS asset_ownership (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ownership_percentage DECIMAL(5, 2) NOT NULL CHECK (ownership_percentage > 0 AND ownership_percentage <= 100),
  acquisition_price DECIMAL(15, 2),
  UNIQUE(asset_id, user_id)
);

-- 7. Proposals table (for group governance)
CREATE TABLE IF NOT EXISTS proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  proposer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  proposal_type TEXT CHECK (proposal_type IN ('payout', 'membership', 'rule_change', 'asset_sale', 'asset_purchase')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'passed', 'rejected', 'expired')),
  voting_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  execution_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Votes table (voting on proposals)
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  voter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vote TEXT NOT NULL CHECK (vote IN ('yes', 'no', 'abstain')),
  voting_power DECIMAL(10, 4) DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(proposal_id, voter_id)
);

-- 9. Transactions table (audit trail for all financial movements)
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  to_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
  amount DECIMAL(15, 2) NOT NULL,
  transaction_type TEXT CHECK (transaction_type IN ('contribution', 'payout', 'transfer', 'fee', 'adjustment')),
  reference_type TEXT CHECK (reference_type IN ('contribution', 'proposal', 'asset', 'manual')),
  reference_id UUID,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_groups_creator ON groups(creator_id);
CREATE INDEX idx_group_members_group ON group_members(group_id);
CREATE INDEX idx_group_members_user ON group_members(user_id);
CREATE INDEX idx_contributions_group ON contributions(group_id);
CREATE INDEX idx_contributions_user ON contributions(user_id);
CREATE INDEX idx_assets_group ON assets(group_id);
CREATE INDEX idx_proposals_group ON proposals(group_id);
CREATE INDEX idx_proposals_proposer ON proposals(proposer_id);
CREATE INDEX idx_votes_proposal ON votes(proposal_id);
CREATE INDEX idx_transactions_from ON transactions(from_user_id);
CREATE INDEX idx_transactions_to ON transactions(to_user_id);
CREATE INDEX idx_transactions_group ON transactions(group_id);

-- RLS Policies (Row Level Security) - Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_ownership ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- RLS: Users can view their own profile and public profiles of group members
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view group members" ON users
  FOR SELECT USING (
    id IN (
      SELECT user_id FROM group_members 
      WHERE group_id IN (
        SELECT group_id FROM group_members WHERE user_id = auth.uid()
      )
    )
  );

-- RLS: Users can view groups they're members of
CREATE POLICY "Users can view own groups" ON groups
  FOR SELECT USING (
    creator_id = auth.uid() OR
    id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
  );

-- RLS: Group members can view their group's members
CREATE POLICY "Members can view group members" ON group_members
  FOR SELECT USING (
    group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
  );

-- RLS: Users can view contributions in their groups
CREATE POLICY "Users can view group contributions" ON contributions
  FOR SELECT USING (
    group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
  );

-- RLS: Users can view assets in their groups
CREATE POLICY "Users can view group assets" ON assets
  FOR SELECT USING (
    group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
  );

-- RLS: Users can view asset ownership for their assets
CREATE POLICY "Users can view asset ownership" ON asset_ownership
  FOR SELECT USING (
    user_id = auth.uid() OR
    asset_id IN (
      SELECT id FROM assets WHERE group_id IN (
        SELECT group_id FROM group_members WHERE user_id = auth.uid()
      )
    )
  );

-- RLS: Users can view proposals in their groups
CREATE POLICY "Users can view group proposals" ON proposals
  FOR SELECT USING (
    group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
  );

-- RLS: Users can view votes on proposals in their groups
CREATE POLICY "Users can view group votes" ON votes
  FOR SELECT USING (
    proposal_id IN (
      SELECT id FROM proposals WHERE group_id IN (
        SELECT group_id FROM group_members WHERE user_id = auth.uid()
      )
    )
  );

-- RLS: Users can view transactions in their groups and their own
CREATE POLICY "Users can view transactions" ON transactions
  FOR SELECT USING (
    from_user_id = auth.uid() OR
    to_user_id = auth.uid() OR
    group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
  );
