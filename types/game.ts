export type Species = {
    id: string;
    common_name: string;
    emoji: string;
    category: string;
    repeat_harvest: boolean;
    base_xp: number;
    typical_yield: number;
    water_every_days: number;
    harvest_cycle_days: number;
    valid_stages: string[];
  };
  
  export type Plant = {
    id: number;
    name: string;
    emoji: string;
    stage: string;
    user_id: string;
    species_id: string | null;
  
    last_watered: string | null;
    health: string | null;
    next_harvest_at: string | null;
  
    estimated_yield: number | null;
    total_harvested: number | null;
    xp_value: number | null;
  };
  
  export type InventoryItem = {
    id: number;
    user_id: string;
    species_id: string;
    quantity: number;
  };
  
  export type HarvestEvent = {
    id: number;
    user_id: string;
    plant_id: number | null;
    species_id: string | null;
    quantity: number;
    xp_earned: number;
    created_at: string;
  };
  
  export type Profile = {
    id: string;
  
    display_name: string;
  
    avatar_emoji: string;
  
    bio: string;
  
    reputation_score: number;
  
    completed_trades: number;
  
    ratings_count: number;
  
    rating_total: number;
  
    created_at: string;
  
    updated_at: string;
  };