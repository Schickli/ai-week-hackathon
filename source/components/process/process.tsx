"use client"

import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Progress } from "../ui/progress";
import { DeclineDialog } from "./decline-dialog";
import { RefreshCcw, Check, TrendingUp } from "lucide-react"
import { GetCaseResponse } from "@/infrastructure/cases/case-repository";
import Image from "next/image";
import CaseImageCarousel from "./image-carousel";

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
  const [similarCases, setSimilarCases] = useState<GetCaseResponse[]>([]);
  const [judgedCount, setJudgedCount] = useState(0);
  const [unjudgedCount, setUnjudgedCount] = useState(0);
  const [scrapedPrices, setScrapedPrices] = useState<Array<{ title: string, price: string, source: string, thumbnail: string }>>([]);
  const [scrapeLoading, setScrapeLoading] = useState(false);
  const [scrapeError, setScrapeError] = useState<string | null>(null);
  const [scrapedProduct, setScrapedProduct] = useState<string | null>(null);
  // Fetch similar cases when caseData changes
  useEffect(() => {
    const fetchSimilarCases = async () => {
      if (!caseData || !Array.isArray(caseData.similar_cases) || caseData.similar_cases.length === 0) {
        setSimilarCases([]);
        return;
      }
      try {
        const results: GetCaseResponse[] = [];
        for (const uuid of caseData.similar_cases) {
          const res = await fetch(`/api/cases/${uuid}`);
          if (res.ok) {
            const data = await res.json();
            results.push(data);
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

      <div className="flex justify-center items-center">
        <div className="flex w-[90vw] gap-8">
          {/* Similar Cases Sidebar */}
          <div className="w-1/3 min-w-[260px] max-w-[400px] overflow-y-auto shadow-2xl rounded-2xl">
            <Card className="p-6 h-full flex flex-col bg-white rounded-2xl">
              <div className="flex items-center gap-3 text-xl font-bold tracking-tight" style={{ fontFamily: 'Poppins, sans-serif', letterSpacing: '0.05em' }}>
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
                        <Image
                          fill
                          src={c.case_images?.[0]?.image_public_url || '/placeholder.jpg'}
                          alt="Similar case"
                          className="object-contain w-full h-full rounded-t-xl"
                          style={{ fontFamily: 'Poppins, sans-serif' }}
                          sizes="(max-width: 400px) 100vw, 400px"
                        />
                      </div>
                      <div className="flex flex-col items-start w-full px-3 py-2 text-sm text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {c.description}
                      </div>
                      <div className="flex w-full justify-between items-end px-3 pb-2">
                        <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-full" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {/* No similarity available */}
                        </span>
                        <span className="text-base font-bold text-green-600 bg-gray-100 px-2 py-1 rounded-full" style={{ fontFamily: 'Poppins, sans-serif' }}>
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
            <Card className="flex flex-col p-0 w-full max-w-5xl bg-white shadow-2xl rounded-2xl border-none overflow-hidden min-h-[40rem]">
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
                  <div className="relative w-full h-auto">
                    <CaseImageCarousel images={caseData.case_images ?? []} />
                    {caseData.created_at && (
                      <span className="absolute bottom-4 right-8 bg-white/80 px-3 py-1 rounded-lg text-xs font-medium text-gray-600 shadow" style={{ fontFamily: 'var(--font-sans)' }}>
                        {`Created: ${new Date(caseData.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col items-start px-8 py-6">
                    <span className="text-xl font-bold text-gray-800 tracking-tight mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      Description
                    </span>
                    <div className="mb-4 text-gray-700 text-base" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {caseData.description ?? ''}
                    </div>
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
                onClick={async () => await handleDecision("approved")}
                aria-label="Approve"
                disabled={!caseData}
              >
                <Check className="w-12 h-12" />
              </Button>
            </div>
          </div>

          {/* Web Price Tool Sidebar (right) */}
          {scrapeActive && (
            <div className="w-1/3 min-w-[260px] max-w-[400px] overflow-y-auto shadow-2xl rounded-2xl">
              <Card className="p-6 h-full flex flex-col bg-white rounded-2xl">
                <div className="flex items-center gap-3 text-xl font-bold tracking-tight mb-2" style={{ fontFamily: 'Poppins, sans-serif', letterSpacing: '0.05em' }}>
                  <TrendingUp className="w-7 h-7 text-purple-400 drop-shadow" />
                  <span className="drop-shadow">Web Prices</span>
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
                ) : scrapedPrices.length === 0 ? (
                  <div className="text-gray-500 text-sm font-medium">No prices found.</div>
                ) : (
                  <>
                    {scrapedProduct && (
                      <div className="mb-2 text-xs text-gray-700 font-semibold">Product: <span className="text-purple-700">{scrapedProduct}</span></div>
                    )}
                    <ul className="space-y-4">
                      {scrapedPrices.map((p, idx) => (
                        <li key={idx} className="flex flex-col gap-1 p-2 rounded-lg bg-gray-50 shadow-sm">
                          <span className="font-semibold text-gray-800 text-sm">{p.title}</span>
                          <span className="font-bold text-purple-600 text-base">{p.price}</span>
                        </li>
                      ))}
                    </ul>
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
