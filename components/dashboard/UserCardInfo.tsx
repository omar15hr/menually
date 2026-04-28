"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Skeleton } from "../ui/skeleton";

interface Profile {
  business_name: string | null;
}

export default function UserSidebarInfo() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return setLoading(false);

      const { data } = await supabase
        .from("profiles")
        .select("business_name")
        .eq("id", user.id)
        .single();

      setProfile(data);
      setLoading(false);
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-1">
        <span className="text-[#0F172A] text-xs font-semibold">
          <Skeleton className="h-3 w-24" />
        </span>
        <span className="text-[#64748B] text-[10px] font-normal">
          <Skeleton className="h-3 w-18" />
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="text-[#0F172A] text-xs font-semibold">
        {profile?.business_name}
      </span>
      <span className="text-[#64748B] text-[10px] font-normal">
        Premium Plan
      </span>
    </div>
  );
}
