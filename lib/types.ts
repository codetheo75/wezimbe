export type UserRole = "creator" | "member";
export type GroupStatus = "active" | "archived" | "closed";
export type ContributionStatus = "pending" | "completed" | "failed";
export type ProposalStatus = "draft" | "voting" | "passed" | "rejected";
export type VoteOption = "yes" | "no" | "abstain";
export type TransactionType = "contribution" | "withdrawal" | "investment" | "dividend";
export type AssetType = "real_estate" | "business" | "land" | "vehicle" | "other";

export interface User {
  id: string;
  email: string;
  phone?: string;
  full_name: string;
  photo_url?: string;
  kyc_status: "pending" | "verified" | "rejected";
  created_at: string;
  updated_at: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  total_balance: number;
  target_balance?: number;
  monthly_target?: number;
  withdrawal_rules?: string;
  status: GroupStatus;
  created_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: UserRole;
  contribution_total: number;
  joined_at: string;
}

export interface Contribution {
  id: string;
  group_id: string;
  user_id: string;
  amount: number;
  payment_method: string;
  status: ContributionStatus;
  created_at: string;
}

export interface Asset {
  id: string;
  group_id: string;
  name: string;
  type: AssetType;
  total_value: number;
  description?: string;
  created_at: string;
}

export interface AssetOwnership {
  id: string;
  asset_id: string;
  user_id: string;
  percentage: number;
  documents_url?: string;
}

export interface Proposal {
  id: string;
  group_id: string;
  created_by: string;
  title: string;
  description?: string;
  type: string;
  status: ProposalStatus;
  created_at: string;
}

export interface Vote {
  id: string;
  proposal_id: string;
  user_id: string;
  vote: VoteOption;
  created_at: string;
}

export interface Transaction {
  id: string;
  group_id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  status: ContributionStatus;
  created_at: string;
}
