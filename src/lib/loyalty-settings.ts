import { createClient } from "@/lib/supabase/server";
import {
  POINTS_PER_1000,
  POINTS_VALUE,
  MIN_REDEEM_POINTS,
  MAX_REDEEM_PERCENT,
  TIER_POINTS_MULTIPLIER,
  TIER_CONFIG,
} from "@/lib/constants";

export interface LoyaltySettings {
  points_per_1000: number;
  points_value: number;
  min_redeem_points: number;
  max_redeem_percent: number;
  tier_multipliers: Record<string, number>;
  tier_config: Record<string, { minOrders: number; minSpent: number }>;
}

/**
 * Load loyalty settings from store_settings DB table.
 * Falls back to hardcoded constants if DB values are missing.
 */
export async function getLoyaltySettings(): Promise<LoyaltySettings> {
  const defaults: LoyaltySettings = {
    points_per_1000: POINTS_PER_1000,
    points_value: POINTS_VALUE,
    min_redeem_points: MIN_REDEEM_POINTS,
    max_redeem_percent: MAX_REDEEM_PERCENT,
    tier_multipliers: { ...TIER_POINTS_MULTIPLIER },
    tier_config: {
      new: { minOrders: 0, minSpent: 0 },
      bronze: { minOrders: TIER_CONFIG.bronze.minOrders, minSpent: TIER_CONFIG.bronze.minSpent },
      silver: { minOrders: TIER_CONFIG.silver.minOrders, minSpent: TIER_CONFIG.silver.minSpent },
      gold: { minOrders: TIER_CONFIG.gold.minOrders, minSpent: TIER_CONFIG.gold.minSpent },
      platinum: { minOrders: TIER_CONFIG.platinum.minOrders, minSpent: TIER_CONFIG.platinum.minSpent },
    },
  };

  try {
    const supabase = await createClient();
    const { data: rows } = await supabase
      .from("store_settings")
      .select("key, value")
      .in("key", [
        "points_per_1000", "points_value", "min_redeem_points", "max_redeem_percent",
        "tier_bronze_min_orders", "tier_bronze_min_spent", "tier_bronze_multiplier",
        "tier_silver_min_orders", "tier_silver_min_spent", "tier_silver_multiplier",
        "tier_gold_min_orders", "tier_gold_min_spent", "tier_gold_multiplier",
        "tier_platinum_min_orders", "tier_platinum_min_spent", "tier_platinum_multiplier",
      ]);

    if (!rows || rows.length === 0) return defaults;

    const map: Record<string, string> = {};
    rows.forEach((r: any) => { map[r.key] = r.value; });

    const num = (key: string, fallback: number) => {
      const v = parseFloat(map[key]);
      return isNaN(v) ? fallback : v;
    };

    return {
      points_per_1000: num("points_per_1000", defaults.points_per_1000),
      points_value: num("points_value", defaults.points_value),
      min_redeem_points: num("min_redeem_points", defaults.min_redeem_points),
      max_redeem_percent: num("max_redeem_percent", defaults.max_redeem_percent),
      tier_multipliers: {
        new: 1,
        bronze: num("tier_bronze_multiplier", defaults.tier_multipliers.bronze),
        silver: num("tier_silver_multiplier", defaults.tier_multipliers.silver),
        gold: num("tier_gold_multiplier", defaults.tier_multipliers.gold),
        platinum: num("tier_platinum_multiplier", defaults.tier_multipliers.platinum),
      },
      tier_config: {
        new: { minOrders: 0, minSpent: 0 },
        bronze: { minOrders: num("tier_bronze_min_orders", defaults.tier_config.bronze.minOrders), minSpent: num("tier_bronze_min_spent", defaults.tier_config.bronze.minSpent) },
        silver: { minOrders: num("tier_silver_min_orders", defaults.tier_config.silver.minOrders), minSpent: num("tier_silver_min_spent", defaults.tier_config.silver.minSpent) },
        gold: { minOrders: num("tier_gold_min_orders", defaults.tier_config.gold.minOrders), minSpent: num("tier_gold_min_spent", defaults.tier_config.gold.minSpent) },
        platinum: { minOrders: num("tier_platinum_min_orders", defaults.tier_config.platinum.minOrders), minSpent: num("tier_platinum_min_spent", defaults.tier_config.platinum.minSpent) },
      },
    };
  } catch {
    return defaults;
  }
}
