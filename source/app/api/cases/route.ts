import { NextResponse } from "next/server";
import { UploadDamageImageSubmitPayload } from "@/components/admin/upload-damage-image";
import {
  CaseRepository,
  GetCaseResponse,
  NextGenDamage,
} from "@/infrastructure/cases/case-repository";
import { processCase } from "@/services/process-case";

export async function POST(req: Request) {
  try {
    const body: UploadDamageImageSubmitPayload = await req.json();

    // Map incoming payload to DB insert shape
    const payload: NextGenDamage = {
      description: body.description,
      category: "TEST",
      case_images: body.case_images.map(image => {
        return {
            image_id: image.imageId,
            image_public_url: image.publicUrl
        }
      }),
      saveToDB: body.saveToDb ?? true,
      estimation: 1000, // not provided yet
      vector: null, // will be filled later with embedding
      case_status: "created", // could default to "new" if you want
      similar_cases: [], // none yet
    };

    const result = await processCase(payload);

    return NextResponse.json(
      {
        ...result
      },
      { status: 200 }
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
// Optional: block other methods
export async function GET() {
  try {
    const data: GetCaseResponse[] = await CaseRepository.getAll();

    return NextResponse.json<GetCaseResponse[]>(data);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
