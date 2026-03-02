"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Contribution } from "@/lib/types";

interface UseContributionsReturn {
  contributions: Contribution[];
  loading: boolean;
  error: string | null;
  addContribution: (groupId: string, amount: number, paymentMethod: string) => Promise<void>;
}

export function useContributions(userId?: string, groupId?: string): UseContributionsReturn {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchContributions() {
      try {
        let query = supabase.from("contributions").select("*");

        if (groupId) {
          query = query.eq("group_id", groupId);
        } else if (userId) {
          query = query.eq("user_id", userId);
        } else {
          setLoading(false);
          return;
        }

        const { data, error: fetchError } = await query.order("created_at", {
          ascending: false,
        });

        if (fetchError) {
          setError(fetchError.message);
          return;
        }

        setContributions(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch contributions");
      } finally {
        setLoading(false);
      }
    }

    fetchContributions();
  }, [userId, groupId, supabase]);

  const addContribution = async (
    groupId: string,
    amount: number,
    paymentMethod: string
  ) => {
    if (!userId) {
      setError("User not authenticated");
      return;
    }

    try {
      const { data: contribution, error: insertError } = await supabase
        .from("contributions")
        .insert({
          group_id: groupId,
          user_id: userId,
          amount,
          payment_method: paymentMethod,
          status: "completed",
        })
        .select()
        .single();

      if (insertError) {
        setError(insertError.message);
        return;
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
        .eq("user_id", userId)
        .single();

      if (member) {
        const newTotal = (member.contribution_total || 0) + amount;
        await supabase
          .from("group_members")
          .update({ contribution_total: newTotal })
          .eq("group_id", groupId)
          .eq("user_id", userId);
      }

      // Add transaction record
      await supabase.from("transactions").insert({
        group_id: groupId,
        user_id: userId,
        type: "contribution",
        amount,
        status: "completed",
      });

      setContributions([contribution, ...contributions]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add contribution");
    }
  };

  return { contributions, loading, error, addContribution };
}
