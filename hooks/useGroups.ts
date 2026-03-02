"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Group, GroupMember } from "@/lib/types";

interface UseGroupsReturn {
  groups: Group[];
  loading: boolean;
  error: string | null;
  createGroup: (name: string, description: string) => Promise<void>;
  joinGroup: (groupId: string) => Promise<void>;
}

export function useGroups(userId?: string): UseGroupsReturn {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchGroups() {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        // Get group IDs for this user
        const { data: memberships, error: memberError } = await supabase
          .from("group_members")
          .select("group_id")
          .eq("user_id", userId);

        if (memberError) {
          setError(memberError.message);
          return;
        }

        const groupIds = memberships?.map((m) => m.group_id) || [];

        if (groupIds.length === 0) {
          setGroups([]);
          setLoading(false);
          return;
        }

        // Fetch group details
        const { data: groupsData, error: groupError } = await supabase
          .from("groups")
          .select("*")
          .in("id", groupIds);

        if (groupError) {
          setError(groupError.message);
          return;
        }

        setGroups(groupsData || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch groups");
      } finally {
        setLoading(false);
      }
    }

    fetchGroups();
  }, [userId, supabase]);

  const createGroup = async (name: string, description: string) => {
    if (!userId) {
      setError("User not authenticated");
      return;
    }

    try {
      const { data: newGroup, error: createError } = await supabase
        .from("groups")
        .insert({
          name,
          description,
          created_by: userId,
          status: "active",
        })
        .select()
        .single();

      if (createError) {
        setError(createError.message);
        return;
      }

      // Add creator as a member
      const { error: memberError } = await supabase
        .from("group_members")
        .insert({
          group_id: newGroup.id,
          user_id: userId,
          role: "creator",
        });

      if (memberError) {
        setError(memberError.message);
        return;
      }

      setGroups([...groups, newGroup]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create group");
    }
  };

  const joinGroup = async (groupId: string) => {
    if (!userId) {
      setError("User not authenticated");
      return;
    }

    try {
      const { error: joinError } = await supabase
        .from("group_members")
        .insert({
          group_id: groupId,
          user_id: userId,
          role: "member",
        });

      if (joinError) {
        setError(joinError.message);
        return;
      }

      // Refresh groups
      const { data: groupData } = await supabase
        .from("groups")
        .select("*")
        .eq("id", groupId)
        .single();

      if (groupData) {
        setGroups([...groups, groupData]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join group");
    }
  };

  return { groups, loading, error, createGroup, joinGroup };
}
