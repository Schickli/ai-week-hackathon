import { createClient } from "../supabase/server"; 

export type NextGenDamage = {
  description: string | null;
  category: string | null;
  case_images: InsertCaseImageRequest[];
  estimation: number | null;         // numeric
  vector: number[] | null;           // Supabase "vector" column
  case_status: string | null;
  similar_cases: string[] | null;    // _uuid[]
};

export type InsertCaseImageRequest = {
  image_id: string;
  image_public_url: string;
}

/** Row returned after insert (at least the id) */
export type NextGenDamageInserted = {
  id: string; // uuid from DB
  created_at: Date
};


export type CaseImage = {
    id: string;
    case_id: string;
    image_id: string;
    image_public_url: string;
}

const TABLE = "next-gen-damage";
const IMAGE_TABLE = "case-images";
const SCHEMA = "public";

export class CaseRepository {
  static async get(id: string): Promise<GetCaseResponse | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from(TABLE)
      .select(`
        id,
        description,
        category,
        estimation,
        vector,
        case_status,
        similar_cases,
        created_at,
        case_images:"${IMAGE_TABLE}" (
          id,
          case_id,
          image_id,
          image_public_url
        )
      `)
      .eq("id", id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch case: ${error.message}`);
    }

    return data;
  }

  static async getAll(): Promise<GetCaseResponse[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from(TABLE)
      .select(`
        id,
        description,
        category,
        estimation,
        vector,
        case_status,
        similar_cases,
        created_at,
        case_images:"${IMAGE_TABLE}" (
          id,
          case_id,
          image_id,
          image_public_url
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch cases: ${error.message}`);
    }

    return data ?? [];
  }

  static async insert(data: NextGenDamage){
    const supabase = await createClient();

    const { data: caseInserted, error: caseError } = await supabase
      .from(TABLE)
      .insert([
        {
          description: data.description,
          category: data.category,
          estimation: data.estimation,
          vector: data.vector,
          case_status: data.case_status,
          similar_cases: data.similar_cases,
        },
      ])
      .select("*")
      .single();

    if (caseError) {
      throw new Error(`Failed to store case: ${caseError.message}`);
    }

    // 2️⃣ Insert related images
    if (data.case_images?.length) {
      const imagesToInsert = data.case_images.map((img) => ({
        case_id: caseInserted.id, // FK
        image_id: img.image_id,
        image_public_url: img.image_public_url,
      }));

      const { error: imageError } = await supabase
        .from(IMAGE_TABLE)
        .insert(imagesToInsert);

      if (imageError) {
        throw new Error(`Failed to store case images: ${imageError.message}`);
      }
    }

    return {
      ...caseInserted,
      case_images: data.case_images ?? [],
    };
  }
}

export type GetCaseResponse = {
  id: string;
  created_at: Date;
  description: string | null;
  category: string | null;
  case_images: CaseImage[];
  estimation: number | null;         // numeric
  vector: number[] | null;           // Supabase "vector" column
  case_status: string | null;
  similar_cases: string[] | null;    // _uuid[]
};
