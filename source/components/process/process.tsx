"use client"

import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Progress } from "../ui/progress";
import { RefreshCcw, X, Check, FileText, BadgeDollarSign, TrendingUp } from "lucide-react"


// Placeholder data and functions
const mockCase = {
  id: 1,
  imageUrl: "https://aexkfdacfobwtdqwrtid.supabase.co/storage/v1/object/public/damage-images/v0/Download%20(1).jpg",
  description: "Front bumper damage after minor collision.",
  aiCostEstimate: "1,200.-",
};

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

async function handleDecision(status: "approve" | "deny") {
  // Replace with actual API endpoint
  await fetch("/api/case/judge", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ caseId: mockCase.id, status }),
  });
  // TODO: Refresh data or show next case
}

export default function Process() {
  const [caseData, setCaseData] = useState(mockCase);
  const [similarCases, setSimilarCases] = useState(mockSimilarCases);
  const [judgedCount, setJudgedCount] = useState(3);
  const [unjudgedCount, setUnjudgedCount] = useState(10);

  const handleRefresh = () => async () => {
    // get request to next js backend to fetch possibly new cases
    const response = await fetch("/api/case/next");
    const data = await response.json();
    setCaseData(data.case);
    setSimilarCases(data.similarCases);
    setJudgedCount(data.judgedCount);
    setUnjudgedCount(data.unjudgedCount);
    console.log("Fetched new case data:", data);
  }
  return (
    <div className="flex flex-col h-auto w-auto">
      <div className="w-full mb-4">
        <div className="flex items-center gap-2 mb-2 justify-end">
          <span className="text-xs px-3 py-1 rounded-full bg-gray-200 font-medium">
            {judgedCount} of {judgedCount + unjudgedCount}
          </span>
          <Button variant="ghost" size="icon" className="size-8" onSubmit={handleRefresh()}>
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
            <Card className="flex flex-col p-0 w-full max-w-xl bg-white shadow-2xl rounded-2xl border-none overflow-hidden">
              <img
                src={caseData.imageUrl}
                alt="Damage"
                className="w-full h-72 object-cover rounded-t-2xl shadow-lg border-none"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              />
              <div className="flex flex-col items-start px-8 py-6">
                <div className="mb-2 text-xl font-bold text-gray-800 tracking-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Description
                </div>
                <div className="mb-4 text-gray-700 text-base" style={{ fontFamily: 'Poppins, sans-serif' }}>{caseData.description}</div>
                <div className="mb-2 text-2xl font-extrabold text-blue-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {caseData.aiCostEstimate}
                </div>
              </div>
            </Card>
            <div className="flex gap-12 mt-[2.5rem] z-10 relative">
              <Button
                variant="outline"
                size="icon"
                className="w-16 h-16 rounded-full border-2 border-red-500 text-red-500 transition-all duration-200 hover:scale-110 hover:bg-red-500 hover:text-white hover:border-red-600 focus:outline-none shadow-lg"
                onClick={() => handleDecision("deny")}
                aria-label="Reject"
              >
                <X className="w-12 h-12" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="w-16 h-16 rounded-full border-2 border-green-500 text-green-500 transition-all duration-200 hover:scale-110 hover:bg-green-500 hover:text-white hover:border-green-600 focus:outline-none shadow-lg"
                onClick={() => handleDecision("approve")}
                aria-label="Approve"
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
