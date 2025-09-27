import { createClient } from "../supabase/server";

export type NextGenDamage = {
  description: string;
  category: string;
  case_images: InsertCaseImageRequest[];
  estimation: number | null; // numeric
  vector: number[] | null; // Supabase "vector" column
  case_status: string;
  similar_cases: SimilarCase[]; // _uuid[]
  saveToDB: boolean;
  ai_image_description?: string | null;
  sources: any | null;
  providerMetadata: any | null;
};

export type SimilarCase = {
  similar_case_id: string;
  case_id: string;
  similarity: number;
};

export type InsertCaseImageRequest = {
  image_id: string;
  image_public_url: string;
};

/** Row returned after insert (at least the id) */
export type NextGenDamageInserted = {
  id: string; // uuid from DB
  created_at: Date;
};

export type CaseImage = {
  id: string;
  case_id: string;
  image_id: string;
  image_public_url: string;
};

export type SimilarCaseRow = {
  id: string;
  case_id: string; // the similar case's id
  similarity: number;
  similar_case_id: string;
};

const TABLE = "next-gen-damage";
const IMAGE_TABLE = "case-images";
const SIMILAR_TABLE = "similar-case";
const SIMILAR_FK_TO_CASE = "case_id";

export class CaseRepository {
  static async get(id: string): Promise<GetCaseResponse | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from(TABLE)
      .select(
        `
        id,
        description,
        category,
        estimation,
        vector,
        case_status,
        created_at,
        case_images:"${IMAGE_TABLE}" (
          id,
          case_id,
          image_id,
          image_public_url
        ),
        similar_cases:"similar-case_case_id_fkey" (
          id,
          case_id,
          similarity,
          similar_case_id
        ),
                    sources,
          provider_metadata,
          ai_image_description
      `
      )
      .eq("id", id)
      .single();

    if (error) throw new Error(`Failed to fetch case: ${error.message}`);
    return data as GetCaseResponse | null;
  }

  static async getAll(): Promise<GetCaseResponse[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from(TABLE)
      .select(
        `
        id,
        description,
        category,
        estimation,
        vector,
        case_status,
        created_at,
        case_images:"${IMAGE_TABLE}" (
          id,
          case_id,
          image_id,
          image_public_url
        ),
        similar_cases:"similar-case_case_id_fkey"   (
          id,
          case_id,
          similarity,
          similar_case_id
        ),
          sources,
          provider_metadata,
          ai_image_description
      `
      )
      .order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to fetch cases: ${error.message}`);
    return (data ?? []) as GetCaseResponse[];
  }

  static async insert(data: NextGenDamage) {
    const supabase = await createClient();

    // 1) insert main case
    const { data: caseInserted, error: caseError } = await supabase
      .from(TABLE)
      .insert([
        {
          description: data.description,
          category: data.category,
          estimation: data.estimation,
          vector: data.vector,
          case_status: data.case_status,
          ai_image_description: data.ai_image_description,
          sources: data.sources,
          provider_metadata: data.providerMetadata,
        },
      ])
      .select("*")
      .single();

    if (caseError)
      throw new Error(`Failed to store case: ${caseError.message}`);

    // 2) insert case images
    if (data.case_images?.length) {
      const imagesToInsert = data.case_images.map((img) => ({
        case_id: caseInserted.id,
        image_id: img.image_id,
        image_public_url: img.image_public_url,
      }));

      const { error: imageError } = await supabase
        .from(IMAGE_TABLE)
        .insert(imagesToInsert);

      if (imageError)
        throw new Error(`Failed to store case images: ${imageError.message}`);
    }

    // 3) insert similar cases
    if (data.similar_cases?.length) {
      const similarToInsert = data.similar_cases.map((s) => ({
        [SIMILAR_FK_TO_CASE]: caseInserted.id, // <-- link to this case
        similarity: s.similarity,
        similar_case_id: s.similar_case_id,
      }));

      const { error: similarError } = await supabase
        .from(SIMILAR_TABLE)
        .insert(similarToInsert);

      if (similarError)
        throw new Error(
          `Failed to store similar cases: ${similarError.message}`
        );
    }

    // 4) return the case; if you want fully-populated relations, re-fetch:
    return {
      ...caseInserted,
      case_images: data.case_images ?? [],
      similar_cases:
        data.similar_cases?.map((s, i) => ({
          id: "", // not known unless you reselect
          case_id: s.case_id,
          similarity: s.similarity,
          similar_case_id: s.similar_case_id,
        })) ?? [],
    } as GetCaseResponse;
  }

  static async updateStatus(id: string, newStatus: string) {
    const supabase = await createClient();
    const { error } = await supabase
      .from(TABLE)
      .update({ case_status: newStatus })
      .eq("id", id);
    if (error)
      throw new Error(`Failed to update case status: ${error.message}`);
  }
}

export type GetCaseResponse = {
  id: string;
  created_at: Date;
  description: string | null;
  category: string | null;
  case_images: CaseImage[];
  estimation: number | null;
  vector: number[] | null;
  case_status: string | null;
  similar_cases: SimilarCaseRow[]; // <- now objects from `similar-case`
  sources: any[] | null;
  provider_metadata: any | null;
  ai_image_description: string | null;
};
