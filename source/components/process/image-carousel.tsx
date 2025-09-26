"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"; // adjust path

type Props = {
  images: { id: string; image_public_url: string }[];
};

export default function CaseImageCarousel({ images }: Props) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Close with ESC
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedIndex(null);
      if (e.key === "ArrowLeft") {
        setSelectedIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));
      }
      if (e.key === "ArrowRight") {
        setSelectedIndex((prev) =>
          prev !== null && prev < images.length - 1 ? prev + 1 : prev
        );
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [images.length]);

  return (
    <div className="w-full min-h-[18rem] flex flex-col">
      <div className="relative w-full" style={{ height: 'min(32rem, calc(100vh - 320px))' }}>
        <Carousel className="w-full h-full">
          <CarouselContent>
            {images.map((img, idx) => (
              <CarouselItem key={img.id || idx} className="h-125 flex items-center justify-center">
                <div className="relative w-full h-full flex items-center justify-center bg-white rounded-t-2xl">
                  <Image
                    src={img.image_public_url}
                    alt={`Damage ${idx + 1}`}
                    fill
                    className="object-contain w-full h-full rounded-t-2xl shadow-lg border-none cursor-pointer"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                    onClick={() => setSelectedIndex(idx)}
                    sizes="(max-width: 900px) 100vw, 900px"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>

      {/* Fullscreen overlay */}
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
          onClick={() => setSelectedIndex(null)}
        >
          <button
            className="absolute top-5 right-5 text-white text-3xl"
            onClick={() => setSelectedIndex(null)}
          >
            ✕
          </button>

          <Image
            src={images[selectedIndex].image_public_url}
            alt={`Damage ${selectedIndex + 1}`}
            width={1200}
            height={800}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl"
          />

          {/* Navigation arrows */}
          {selectedIndex > 0 && (
            <button
              className="absolute left-5 text-white text-4xl"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex((prev) => (prev! > 0 ? prev! - 1 : prev));
              }}
            >
              ‹
            </button>
          )}
          {selectedIndex < images.length - 1 && (
            <button
              className="absolute right-5 text-white text-4xl"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex((prev) =>
                  prev! < images.length - 1 ? prev! + 1 : prev
                );
              }}
            >
              ›
            </button>
          )}
        </div>
      )}
    </div>
  );
}
