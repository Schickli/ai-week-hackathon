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