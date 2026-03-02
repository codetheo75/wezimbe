import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { proposalId, vote } = body;

    if (!proposalId || !vote || !["yes", "no", "abstain"].includes(vote)) {
      return NextResponse.json(
        { error: "Invalid vote data" },
        { status: 400 }
      );
    }

    // Check if user already voted
    const { data: existingVote } = await supabase
      .from("votes")
      .select("id")
      .eq("proposal_id", proposalId)
      .eq("user_id", user.id)
      .single();

    if (existingVote) {
      return NextResponse.json(
        { error: "You have already voted on this proposal" },
        { status: 400 }
      );
    }

    // Create vote
    const { data: voteRecord, error: voteError } = await supabase
      .from("votes")
      .insert({
        proposal_id: proposalId,
        user_id: user.id,
        vote,
      })
      .select()
      .single();

    if (voteError) {
      return NextResponse.json({ error: voteError.message }, { status: 400 });
    }

    return NextResponse.json(voteRecord, { status: 201 });
  } catch (error) {
    console.error("Error creating vote:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
