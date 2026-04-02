// Check if running in demo mode (no real Supabase)
export const isDemo =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder") ?? false;
