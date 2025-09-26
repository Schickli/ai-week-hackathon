import { createClient } from "../supabase/server"; 

export type NextGenDamage = {
  description: string | null;
  category: string | null;
  image_id: string | null;
  image_public_url: string | null;
  estimation: number | null;         // numeric
  vector: number[] | null;           // Supabase "vector" column
  case_status: string | null;
  similar_cases: string[] | null;    // _uuid[]
};

const TABLE = "nest-gen-damage";

export class CaseRepository {
  static async get(id: string): Promise<GetCaseResponse | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .eq("id", id)
      .single(); // ensures exactly 1 row or error

    if (error) {
      throw new Error(`Failed to fetch case: ${error.message}`);
    }

    return data;
  }

  static async getAll(): Promise<GetCaseResponse[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch cases: ${error.message}`);
    }

    return data ?? [];
  }

  static async insert(data: NextGenDamage){
    const supabase = await createClient();

    const { data: inserted, error } = await supabase
      .from(`${TABLE}`)
      .insert([data])
      .select("*")
      .single();

    if (error) {
      throw new Error(`Failed to store damage record: ${error.message}`);
    }

    
    return inserted ?? []
  }
}

export type GetCaseResponse = {
  id: string;
  created_at: Date;
  description: string | null;
  category: string | null;
  image_id: string | null;
  image_public_url: string | null;
  estimation: number | null;         // numeric
  vector: number[] | null;           // Supabase "vector" column
  case_status: string | null;
  similar_cases: string[] | null;    // _uuid[]
};
