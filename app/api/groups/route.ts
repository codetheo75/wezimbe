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
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Group name is required" },
        { status: 400 }
      );
    }

    // Create group
    const { data: group, error: groupError } = await supabase
      .from("groups")
      .insert({
        name,
        description: description || "",
        created_by: user.id,
        status: "active",
      })
      .select()
      .single();

    if (groupError) {
      return NextResponse.json({ error: groupError.message }, { status: 400 });
    }

    // Add creator as member
    const { error: memberError } = await supabase
      .from("group_members")
      .insert({
        group_id: group.id,
        user_id: user.id,
        role: "creator",
      });

    if (memberError) {
      return NextResponse.json({ error: memberError.message }, { status: 400 });
    }

    return NextResponse.json(group, { status: 201 });
  } catch (error) {
    console.error("Error creating group:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
