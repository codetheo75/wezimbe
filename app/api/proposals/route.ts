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
    const { groupId, title, description, type } = body;

    if (!groupId || !title) {
      return NextResponse.json(
        { error: "Group ID and title are required" },
        { status: 400 }
      );
    }

    // Verify user is a member of the group
    const { data: membership } = await supabase
      .from("group_members")
      .select("id")
      .eq("group_id", groupId)
      .eq("user_id", user.id)
      .single();

    if (!membership) {
      return NextResponse.json(
        { error: "You are not a member of this group" },
        { status: 403 }
      );
    }

    // Create proposal
    const { data: proposal, error: proposalError } = await supabase
      .from("proposals")
      .insert({
        group_id: groupId,
        created_by: user.id,
        title,
        description: description || "",
        type: type || "general",
        status: "voting",
      })
      .select()
      .single();

    if (proposalError) {
      return NextResponse.json(
        { error: proposalError.message },
        { status: 400 }
      );
    }

    return NextResponse.json(proposal, { status: 201 });
  } catch (error) {
    console.error("Error creating proposal:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
