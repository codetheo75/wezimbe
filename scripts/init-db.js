import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function initializeDatabase() {
  console.log("Initializing Wezimbe database schema...");

  const sql = `
    -- Create tables if they don't exist
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      full_name TEXT NOT NULL,
      photo_url TEXT,
      kyc_status TEXT DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'verified', 'rejected')),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS groups (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      description TEXT,
      created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      total_balance DECIMAL(15,2) DEFAULT 0,
      target_balance DECIMAL(15,2),
      monthly_target DECIMAL(15,2),
      withdrawal_rules TEXT,
      status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'closed')),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS group_members (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role TEXT DEFAULT 'member' CHECK (role IN ('creator', 'member')),
      contribution_total DECIMAL(15,2) DEFAULT 0,
      joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(group_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS contributions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      amount DECIMAL(15,2) NOT NULL,
      payment_method TEXT,
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS assets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('real_estate', 'business', 'land', 'vehicle', 'other')),
      total_value DECIMAL(15,2) NOT NULL,
      description TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS asset_ownership (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      percentage DECIMAL(5,2) NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
      documents_url TEXT,
      UNIQUE(asset_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS proposals (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
      created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      type TEXT,
      status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'voting', 'passed', 'rejected')),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS votes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      vote TEXT NOT NULL CHECK (vote IN ('yes', 'no', 'abstain')),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(proposal_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL CHECK (type IN ('contribution', 'withdrawal', 'investment', 'dividend')),
      amount DECIMAL(15,2) NOT NULL,
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Create indexes for common queries
    CREATE INDEX IF NOT EXISTS idx_groups_created_by ON groups(created_by);
    CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);
    CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
    CREATE INDEX IF NOT EXISTS idx_contributions_user_id ON contributions(user_id);
    CREATE INDEX IF NOT EXISTS idx_contributions_group_id ON contributions(group_id);
    CREATE INDEX IF NOT EXISTS idx_assets_group_id ON assets(group_id);
    CREATE INDEX IF NOT EXISTS idx_proposals_group_id ON proposals(group_id);
    CREATE INDEX IF NOT EXISTS idx_votes_proposal_id ON votes(proposal_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_group_id ON transactions(group_id);

    -- Enable Row Level Security
    ALTER TABLE users ENABLE ROW LEVEL SECURITY;
    ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
    ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
    ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;
    ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
    ALTER TABLE asset_ownership ENABLE ROW LEVEL SECURITY;
    ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
    ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
    ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

    -- RLS Policies for users table
    CREATE POLICY "Users can view their own profile" ON users FOR SELECT
      USING (auth.uid() = id);

    CREATE POLICY "Users can update their own profile" ON users FOR UPDATE
      USING (auth.uid() = id);

    -- RLS Policies for groups (group members can view/interact)
    CREATE POLICY "Group members can view group" ON groups FOR SELECT
      USING (EXISTS (
        SELECT 1 FROM group_members WHERE group_members.group_id = groups.id AND group_members.user_id = auth.uid()
      ) OR created_by = auth.uid());

    -- RLS Policies for group_members
    CREATE POLICY "Group members can view members of their group" ON group_members FOR SELECT
      USING (EXISTS (
        SELECT 1 FROM group_members gm WHERE gm.group_id = group_members.group_id AND gm.user_id = auth.uid()
      ));

    -- RLS Policies for contributions
    CREATE POLICY "Users can view contributions in their groups" ON contributions FOR SELECT
      USING (EXISTS (
        SELECT 1 FROM group_members WHERE group_members.group_id = contributions.group_id AND group_members.user_id = auth.uid()
      ));

    -- RLS Policies for assets
    CREATE POLICY "Group members can view assets" ON assets FOR SELECT
      USING (EXISTS (
        SELECT 1 FROM group_members WHERE group_members.group_id = assets.group_id AND group_members.user_id = auth.uid()
      ));

    -- RLS Policies for proposals
    CREATE POLICY "Group members can view proposals" ON proposals FOR SELECT
      USING (EXISTS (
        SELECT 1 FROM group_members WHERE group_members.group_id = proposals.group_id AND group_members.user_id = auth.uid()
      ));

    -- RLS Policies for votes
    CREATE POLICY "Group members can view votes" ON votes FOR SELECT
      USING (EXISTS (
        SELECT 1 FROM votes v2 
        JOIN proposals ON v2.proposal_id = proposals.id 
        JOIN group_members ON group_members.group_id = proposals.group_id 
        WHERE v2.id = votes.id AND group_members.user_id = auth.uid()
      ));

    -- RLS Policies for transactions
    CREATE POLICY "Group members can view transactions" ON transactions FOR SELECT
      USING (EXISTS (
        SELECT 1 FROM group_members WHERE group_members.group_id = transactions.group_id AND group_members.user_id = auth.uid()
      ));
  `;

  try {
    // Execute SQL via the admin API
    const { error } = await supabase.rpc("exec", { sql });
    
    if (error) {
      console.error("Error initializing database:", error);
      process.exit(1);
    }

    console.log("✅ Database schema initialized successfully!");
  } catch (error) {
    console.error("Error executing SQL:", error);
    process.exit(1);
  }
}

initializeDatabase();
