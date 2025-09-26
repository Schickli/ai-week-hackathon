import { CaseRepository, GetCaseResponse } from "@/infrastructure/cases/case-repository";
import { NextResponse } from "next/server";

// GET /api/cases/[id]
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const data: GetCaseResponse | null = await CaseRepository.get(id);

    if (!data) {
      return NextResponse.json(
        { error: "Case not found" },
        { status: 404 }
      );
    }

    return NextResponse.json<GetCaseResponse>(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}

// PATCH /api/cases/[id]
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();

    if (!body.case_status) {
      return NextResponse.json(
        { error: "Missing case_status" },
        { status: 400 }
      );
    }

    await CaseRepository.updateStatus(id, body.case_status);

    // Return no content (204)
    return new Response(null, { status: 204 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}