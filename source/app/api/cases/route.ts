import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Url } from "url";
import { UploadDamageImageSubmitPayload } from "@/components/admin/upload-damage-image";
import { CaseRepository, GetCaseResponse, NextGenDamage } from "@/infrastructure/cases/case-repository";
import { processCase } from "@/services/process-case";

type StoreResponse = { 
    success: true; 
    id: string;
    created_at: Date; 
} | { error: string };

export async function POST(req: Request) {
  try {
    const body: UploadDamageImageSubmitPayload = await req.json();

    // Map incoming payload to DB insert shape
    const payload: NextGenDamage = {
      description: body.description ?? null,
      category: "TEST",
      image_id: body.imageId ?? null,
      image_public_url: body.publicUrl ?? null,
      estimation: 10,       // not provided yet
      vector: null,           // will be filled later with embedding
      case_status: "approved",      // could default to "new" if you want
      similar_cases: null,    // none yet
    };

    var result = await processCase(payload);

    return NextResponse.json({ 
        success: true,
        id: result.id,
        created_at: result.created_at
       } satisfies StoreResponse,
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Unexpected error" } satisfies StoreResponse,
      { status: 500 }
    );
  }
}
// Optional: block other methods
export async function GET() {
  try {
    const data: GetCaseResponse[] = await CaseRepository.getAll();

    return NextResponse.json<GetCaseResponse[]>(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}