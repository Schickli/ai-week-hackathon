"use client"

import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Progress } from "../ui/progress";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "../ui/carousel";
import { DeclineDialog } from "./decline-dialog";
import { RefreshCcw, X, Check, TrendingUp } from "lucide-react"
import { GetCaseResponse } from "@/infrastructure/cases/case-repository";

const mockSimilarCases = [
  {
    id: 2,
    imageUrl: "https://aexkfdacfobwtdqwrtid.supabase.co/storage/v1/object/public/damage-images/v0/Download%20(1).jpg",
    description: "Rear bumper scratch",
    cost: "800.-",
    similarity: "92%"
  },
  {
    id: 3,
    imageUrl: "https://aexkfdacfobwtdqwrtid.supabase.co/storage/v1/object/public/damage-images/v0/Download%20(1).jpg",
    description: "Side door dent",
    cost: "950.-",
    similarity: "88%"
  },
  {
    id: 4,
    imageUrl: "https://aexkfdacfobwtdqwrtid.supabase.co/storage/v1/object/public/damage-images/v0/Download%20(1).jpg",
    description: "Front fender damage",
    cost: "1,050.-",
    similarity: "85%"
  }
];

export default function Process() {
  const handleDecision = async (status: "approve" | "declined") => {
    if (!caseData) return;
    await fetch(`/api/cases/${caseData.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ case_status: status === "approve" ? "approved" : "declined" }),
    });
    await handleRefresh()();
  };
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false);
  const declineOptions = [
    { label: "Image not clear", value: "image_not_clear" },
    { label: "Description missing", value: "description_missing" },
    { label: "Not a damage case", value: "not_damage_case" },
    { label: "Other", value: "other" },
  ];
  const handleDecline = async (reason: string) => {
    setDeclineDialogOpen(false);
    await handleDecision("declined");
  };
  const [loading, setLoading] = useState(false);
  const [caseData, setCaseData] = useState<GetCaseResponse | null>(null);
  const [similarCases, setSimilarCases] = useState(mockSimilarCases);
  const [judgedCount, setJudgedCount] = useState(0);
  const [unjudgedCount, setUnjudgedCount] = useState(0);

  const handleRefresh = () => async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/cases");
      const data: GetCaseResponse[] = await response.json();
      setJudgedCount(data.filter((c) => c.case_status === "approved" || c.case_status === "declined").length);
      setUnjudgedCount(data.filter((c) => c.case_status !== "approved" && c.case_status !== "declined").length);
      const unjudgedCases = data.filter((c) => c.case_status !== "approved" && c.case_status !== "declined");
      unjudgedCases.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      if (unjudgedCases.length > 0) {
        setCaseData(unjudgedCases[0]);
      } else {
        setCaseData(null);
      }
    } catch (err) {
    }
    setLoading(false);
  }

  useEffect(() => {
    setLoading(true);
    handleRefresh()().finally(() => setLoading(false));
  }, []);
  return (
    <div className="flex flex-col h-auto w-auto">
      <div className="w-full mb-4">
        <div className="flex items-center gap-2 mb-2 justify-end">
          <span className="text-xs px-3 py-1 rounded-full bg-gray-200 font-medium">
            {judgedCount} of {judgedCount + unjudgedCount}
          </span>
          <Button variant="ghost" size="icon" className="size-8" onClick={handleRefresh()}>
            <RefreshCcw />
          </Button>
        </div>
        <Progress value={((judgedCount) / (judgedCount + unjudgedCount)) * 100} className="h-4" />
      </div>

      <div className="flex justify-center items-center">
        <div className="flex w-[90vw] gap-8">
          <div className="w-1/3 min-w-[260px] max-w-[400px] overflow-y-auto shadow-2xl rounded-2xl">
            <Card className="p-6 h-full flex flex-col bg-white rounded-2xl">
              <div className="flex items-center gap-3 text-xl font-bold tracking-tight" style={{ fontFamily: 'Poppins, sans-serif', letterSpacing: '0.05em' }}>
                <TrendingUp className="w-7 h-7 text-blue-400 drop-shadow" />
                <span className="drop-shadow">Similar Cases</span>
              </div>
              <ul className="space-y-6">
                {similarCases.slice(0, 3).map((c) => (
                  <li key={c.id} className="flex flex-col items-center p-0 rounded-xWl bg-white shadow-sm hover:shadow-md transition-shadow">
                    <img
                      src={c.imageUrl}
                      alt="Similar case"
                      className="w-full h-32 object-cover rounded-t-xl"
                      style={{ fontFamily: 'Poppins, sans-serif' }}
                    />
                    <div className="w-full px-3 py-2 text-sm text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {c.description}
                    </div>
                    <div className="flex w-full justify-between items-end px-3 pb-2">
                      <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-full" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {c.similarity} Similarity
                      </span>
                      <span className="text-base font-bold text-green-600 bg-gray-100 px-2 py-1 rounded-full" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {c.cost}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center">
            <Card className="flex flex-col p-0 w-full max-w-3xl bg-white shadow-2xl rounded-2xl border-none overflow-hidden min-h-[20rem]">
              {loading ? (
                <div className="flex flex-col items-center justify-center min-h-[22rem] gap-4">
                  <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                  <span className="text-blue-500 text-lg font-medium">Loading active case...</span>
                </div>
              ) : caseData ? (
                <>
                  <div className="w-full min-h-[25rem] flex flex-col">
                    <div className="relative w-full">
                      <Carousel className="w-full h-72">
                        <CarouselContent>
                          {(caseData.case_images ?? []).map((img, idx) => (
                            <CarouselItem key={img.id || idx} className="h-72">
                              <img
                                src={img.image_public_url}
                                alt={`Damage ${idx + 1}`}
                                className="w-full h-72 object-cover rounded-t-2xl shadow-lg border-none"
                                style={{ fontFamily: 'Poppins, sans-serif' }}
                              />
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                        <CarouselPrevious />
                        <CarouselNext />
                      </Carousel>
                    </div>
                  </div>
                  <div className="flex flex-col items-start px-8 py-6">
                    <div className="mb-2 flex items-center justify-between w-full">
                      <span className="text-xl font-bold text-gray-800 tracking-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Description
                      </span>
                      {caseData.created_at && (
                        <span className="bg-white/80 px-3 py-1 rounded-lg text-xs font-medium text-gray-600 shadow ml-4" style={{ fontFamily: 'var(--font-sans)' }}>
                          {`Created: ${new Date(caseData.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`}
                        </span>
                      )}
                    </div>
                    <div className="mb-4 text-gray-700 text-base" style={{ fontFamily: 'Poppins, sans-serif' }}>{caseData.description ?? ''}</div>
                    <div className="mb-2 flex items-center gap-4">
                      <span className="text-2xl font-extrabold text-blue-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {caseData.estimation !== null ? `${caseData.estimation}.-` : 'No estimate'}
                      </span>
                      {typeof caseData.estimation === 'number' && (
                        <span className="text-lg font-semibold text-green-600 bg-green-100 px-3 py-1 rounded-full" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {`Confidence: ${(1 * 100).toFixed(1)}%`}
                        </span>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[22rem]">
                  <span className="text-gray-500">No unjudged cases available.</span>
                </div>
              )}
            </Card>
            <div className="flex gap-12 mt-[2.5rem] z-10 relative">
              <DeclineDialog
                open={declineDialogOpen}
                onOpenChange={setDeclineDialogOpen}
                declineOptions={declineOptions}
                onDecline={handleDecline}
                disabled={!caseData}
              />
              <Button
                variant="outline"
                size="icon"
                className="w-16 h-16 rounded-full border-2 border-green-500 text-green-500 transition-all duration-200 hover:scale-110 hover:bg-green-500 hover:text-white hover:border-green-600 focus:outline-none shadow-lg"
                onClick={async () => await handleDecision("approve")}
                aria-label="Approve"
                disabled={!caseData}
              >
                <Check className="w-12 h-12" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
