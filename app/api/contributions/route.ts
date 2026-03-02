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
    const { groupId, amount, paymentMethod } = body;

    if (!groupId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid contribution data" },
        { status: 400 }
      );
    }

    // Create contribution record
    const { data: contribution, error: contributionError } = await supabase
      .from("contributions")
      .insert({
        group_id: groupId,
        user_id: user.id,
        amount,
        payment_method: paymentMethod || "mobile_money",
        status: "completed",
      })
      .select()
      .single();

    if (contributionError) {
      return NextResponse.json(
        { error: contributionError.message },
        { status: 400 }
      );
    }

    // Update group balance
    const { data: group } = await supabase
      .from("groups")
      .select("total_balance")
      .eq("id", groupId)
      .single();

    if (group) {
      const newBalance = (group.total_balance || 0) + amount;
      await supabase
        .from("groups")
        .update({ total_balance: newBalance })
        .eq("id", groupId);
    }

    // Update member contribution total
    const { data: member } = await supabase
      .from("group_members")
      .select("contribution_total")
      .eq("group_id", groupId)
      .eq("user_id", user.id)
      .single();

    if (member) {
      const newTotal = (member.contribution_total || 0) + amount;
      await supabase
        .from("group_members")
        .update({ contribution_total: newTotal })
        .eq("group_id", groupId)
        .eq("user_id", user.id);
    }

    // Create transaction record
    await supabase.from("transactions").insert({
      group_id: groupId,
      user_id: user.id,
      type: "contribution",
      amount,
      status: "completed",
    });

    return NextResponse.json(contribution, { status: 201 });
  } catch (error) {
    console.error("Error creating contribution:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
