"use client"

import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Progress } from "../ui/progress";
import { DeclineDialog } from "./decline-dialog";
import { RefreshCcw, Check, TrendingUp, Brain } from "lucide-react"
import { GetCaseResponse } from "@/infrastructure/cases/case-repository";

type SimilarCaseWithConfidence = GetCaseResponse & { similarity: number };
import Image from "next/image";
import CaseImageCarousel from "./image-carousel";
import ActiveCaseImageCarousel from "./active-case-image-carousel";

// Removed mockSimilarCases. Will fetch real similar cases from API.


export default function Process() {
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false);
  const [scrapeActive, setScrapeActive] = useState(false); // THIS USESTATE NEEDS TO BE ACTIVATED IN ORDER TO SHOW THE WEB PRICE TOOL
  const declineOptions = [
    { label: "Image not clear", value: "image_not_clear" },
    { label: "Description missing", value: "description_missing" },
    { label: "Not a damage case", value: "not_damage_case" },
    { label: "Other", value: "other" },
  ];
  const handleDecline = async () => {
    setDeclineDialogOpen(false);
    await handleDecision("declined");
  };
  const [loading, setLoading] = useState(false);
  const [caseData, setCaseData] = useState<GetCaseResponse | null>(null);
  const [similarCases, setSimilarCases] = useState<SimilarCaseWithConfidence[]>([]);
  const [judgedCount, setJudgedCount] = useState(0);
  const [unjudgedCount, setUnjudgedCount] = useState(0);
  const [scrapedPrices, setScrapedPrices] = useState<Array<{ title: string, price: string, source: string, thumbnail: string }>>([]);
  const [scrapeLoading, setScrapeLoading] = useState(false);
  const [scrapeError, setScrapeError] = useState<string | null>(null);
  const [scrapedProduct, setScrapedProduct] = useState<string | null>(null);
  // Fetch similar cases when caseData changes (new structure)
  useEffect(() => {
    const fetchSimilarCases = async () => {
      if (!caseData || !Array.isArray(caseData.similar_cases) || caseData.similar_cases.length === 0) {
        setSimilarCases([]);
        return;
      }
      try {
        const results: SimilarCaseWithConfidence[] = [];
        for (const simObj of caseData.similar_cases) {
          if (!simObj.similar_case_id) continue;
          const res = await fetch(`/api/cases/${simObj.similar_case_id}`);
          if (res.ok) {
            const data = await res.json();
            results.push({ ...data, similarity: simObj.similarity });
          }
        }
        setSimilarCases(results);
      } catch (err) {
        setSimilarCases([]);
      }
    };
    fetchSimilarCases();
  }, [caseData]);

  useEffect(() => {
    setScrapeActive(false);
  }, [caseData]);

  useEffect(() => {
    const runScrape = async () => {
      if (!scrapeActive || !caseData || !caseData.case_images?.[0]?.image_public_url) return;
      setScrapeLoading(true);
      setScrapeError(null);
      setScrapedPrices([]);
      setScrapedProduct(null);
      try {
        const imageUrl = encodeURIComponent(caseData.case_images[0].image_public_url);
        const response = await fetch(`/api/prices?image_url=${imageUrl}`);
        if (!response.ok) {
          throw new Error('API request failed');
        }
        const result = await response.json();
        console.log("Scrape result:", result);
        setScrapedProduct(result.productName);
        setScrapedPrices(result.prices ?? []);
      } catch (err) {
        console.error("Scrape error:", err);
        setScrapeError("Failed to fetch product/prices.");
      }
      setScrapeLoading(false);
    };
    runScrape();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrapeActive, caseData]);
  const handleDecision = async (status: "approved" | "declined") => {
    if (!caseData) return;
    await fetch(`/api/cases/${caseData.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ case_status: status === "approved" ? "approved" : "declined" }),
    });
    await handleRefresh()();
  };

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
      console.log(err)
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

      <div className="flex justify-center items-start">
        <div className="flex w-[90vw] gap-8 ">
          {/* Similar Cases Sidebar */}
          <div className="w-1/3 min-w-[160px] max-w-[300px] shadow-2xl rounded-2xl">
            <Card className="p-6 flex flex-col bg-white rounded-2xl max-h-[75vh] overflow-y-auto">
              <div className="flex items-center gap-3 text-l font-bold tracking-tight" style={{ fontFamily: 'Poppins, sans-serif', letterSpacing: '0.05em' }}>
                <TrendingUp className="w-7 h-7 text-blue-400 drop-shadow" />
                <span className="drop-shadow">Similar Cases</span>
              </div>
              {similarCases.length === 0 ? (
                <div className="text-gray-500 text-sm mt-6">No similar cases found.</div>
              ) : (
                <ul className="space-y-6">
                  {similarCases.slice(0, 3).map((c) => (
                    <li key={c.id} className="flex flex-col items-stretch p-0 rounded-xWl bg-white shadow-sm hover:shadow-md transition-shadow">
                      <div className="relative w-full aspect-[4/3] bg-gray-100 rounded-t-xl overflow-hidden">
                        <CaseImageCarousel images={c.case_images ?? []} />
                      </div>
                      <div className="flex flex-col items-start w-full px-3 py-2 text-xs text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {c.description}
                      </div>
                      <div className="flex w-full justify-between items-end px-3 pb-2">
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          Similarity: {typeof c.similarity === 'number' ? `${(c.similarity * 100).toFixed(1)}%` : 'N/A'}
                        </span>
                        <span className="text-sm font-bold text-green-600 bg-gray-100 px-2 py-1 rounded-full" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {typeof c.estimation === 'number' ? `${c.estimation}.-` : 'No estimate'}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          {/* Active Case Center */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <Card className="flex flex-col p-0 w-full max-w-3xl bg-white shadow-2xl rounded-2xl border-none overflow-hidden min-h-[30rem]">
              {loading ? (
                <div className="flex flex-col items-center justify-center min-h-[12rem] gap-4">
                  <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                  <span className="text-blue-500 text-lg font-medium">Loading active case...</span>
                </div>
              ) : caseData ? (
                <>
                  <div className="relative w-full h-auto">
                    <ActiveCaseImageCarousel images={caseData.case_images ?? []} />
                    {caseData.created_at && (
                      <span className="absolute bottom-4 right-8 bg-white/80 px-3 py-1 rounded-lg text-xs font-medium text-gray-600 shadow" style={{ fontFamily: 'var(--font-sans)' }}>
                        {`Created: ${new Date(caseData.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col items-start px-8 py-4">
                    <div className="flex w-full items-center mb-1">
                      <span className="text-md font-bold text-gray-800 tracking-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {caseData.description ?? ''}
                      </span>
                      <div className="flex-1" />
                      {caseData.category && (
                        <span className="inline-block px-3 py-1 rounded-full bg-gray-200 text-gray-700 text-xs font-semibold tracking-wide shadow-sm ml-4" style={{ fontFamily: 'Poppins, sans-serif', letterSpacing: '0.05em' }}>
                          {caseData.category}
                        </span>
                      )}
                    </div>
                    {caseData.ai_image_description && (
                      <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2 mb-2 mt-1 shadow-sm">
                        <Brain className="w-12 h-12 text-blue-500 mx-2" />
                        <span className="text-sm text-blue-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {caseData.ai_image_description}
                        </span>
                      </div>
                    )}
                    <div className="flex w-full items-center bg-green-50 border border-green-200 rounded-xl px-3 py-2 mb-2 shadow-sm">
                      <span className="text-sm font-semibold text-green-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        AI Estimated Value
                      </span>
                      <div className="flex-1" />
                      <span className="text-xl font-extrabold text-green-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {caseData.estimation !== null ? `${caseData.estimation}.-` : 'No estimate'}
                      </span>
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
                onClick={async () => await handleDecision("approved")}
                aria-label="Approve"
                disabled={!caseData}
              >
                <Check className="w-12 h-12" />
              </Button>
            </div>
          </div>

          {(scrapeActive || (caseData && ((Array.isArray(caseData.sources) && caseData.sources.length > 0) || caseData.provider_metadata))) && (
            <div className="w-1/3 min-w-[160px] max-w-[300px] shadow-2xl rounded-2xl">
              <Card className="p-6 flex flex-col bg-white rounded-2xl overflow-y-auto">
                <div className="flex items-center gap-3 text-l font-bold tracking-tight mb-2" style={{ fontFamily: 'Poppins, sans-serif', letterSpacing: '0.05em' }}>
                  <TrendingUp className="w-7 h-7 text-purple-400 drop-shadow" />
                  <span className="drop-shadow">Web search results</span>
                </div>
                {scrapeLoading ? (
                  <div className="flex flex-col items-center justify-center min-h-[10rem] gap-2">
                    <svg className="animate-spin h-8 w-8 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                    <span className="text-purple-500 text-base font-medium">Scraping prices...</span>
                  </div>
                ) : scrapeError ? (
                  <div className="text-red-500 text-sm font-medium">{scrapeError}</div>
                ) : (
                  <>
                    {caseData?.sources && Array.isArray(caseData.sources) && caseData.sources.length > 0 && (
                      <div className="mt-6">
                        <div className="text-xs font-bold text-gray-500 mb-1">Websearch Sources</div>
                        <ul className="space-y-2">
                          {caseData.sources.map((src, idx) => (
                            <li key={idx} className="text-xs text-blue-700 bg-gray-50 rounded px-2 py-1 break-all">
                              {src.url ? (
                                <a href={src.url} target="_blank" rel="noopener noreferrer" className="underline">
                                  {src.url}
                                </a>
                              ) : (
                                typeof src === 'string' ? src : JSON.stringify(src)
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
