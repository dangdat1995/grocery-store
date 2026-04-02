"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/types";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        setProfile(data);
      }

      setLoading(false);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);

      if (session?.user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        setProfile(data);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithPhone = async (phone: string) => {
    // Format Vietnamese phone: 0901234567 → +84901234567
    const formatted = phone.startsWith("0")
      ? "+84" + phone.slice(1)
      : phone;

    const { error } = await supabase.auth.signInWithOtp({ phone: formatted });
    return { error };
  };

  const verifyOtp = async (phone: string, token: string) => {
    const formatted = phone.startsWith("0")
      ? "+84" + phone.slice(1)
      : phone;

    const { data, error } = await supabase.auth.verifyOtp({
      phone: formatted,
      token,
      type: "sms",
    });
    return { data, error };
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signUpWithEmail = async (
    email: string,
    password: string,
    fullName: string
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    return { data, error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const isAdmin = profile?.role === "admin";

  return {
    user,
    profile,
    loading,
    isAdmin,
    signInWithPhone,
    verifyOtp,
    signInWithEmail,
    signUpWithEmail,
    signOut,
  };
}
