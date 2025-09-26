// Liste von Testfällen (Kunden-/Schadennummern) die im Benchmark gegen die API geprüft werden sollen.
// IDs müssen den Werten in der CSV-Spalte "Kunden-Nr." entsprechen.
export const testcases = [
	{ id: 10250 },
	// { id: 11951 },
	// { id: 11893 },
	// { id: 11892 },
	// { id: 11890 },
	// { id: 11867 },
	// { id: 11865 },
	// { id: 11770 },
	// { id: 11766 },
	// { id: 11741 },
	// { id: 11696 },
	// { id: 11695 },
	// { id: 11687 },
	// { id: 11685 },
	// { id: 11653 },
	// { id: 11649 },
	// { id: 11638 },
	// { id: 11631 },
	// { id: 11629 },
	// { id: 11436 },
	// { id: 11423 },
	// { id: 11394 },
	// { id: 11312 },
	// { id: 11291 },
	// { id: 11283 },
	// { id: 11218 },
	// { id: 11156 },
	// { id: 11141 },
	// { id: 11094 },
	// { id: 11049 },
	// { id: 11031 },
	// { id: 11007 },
	// { id: 11004 },
	// { id: 10992 },
	// { id: 10981 },
	// { id: 10980 },
	// { id: 10976 },
	// { id: 10970 },
	// { id: 10968 },
	// { id: 10935 },
	// { id: 10923 },
	// { id: 10921 },
	// { id: 10911 },
	// { id: 10893 },
	// { id: 10885 },
	// { id: 10865 },
	// { id: 10839 },
	// { id: 10824 },
	// { id: 10703 },
	// { id: 10607 },
	// { id: 10536 },
	// { id: 10513 },
	// { id: 10250 },
	// { id: 10171 },
	// { id: 10138 },
	// { id: 10052 },
];

export const SUPABASE_PUBLIC_PREFIX =
	"https://aexkfdacfobwtdqwrtid.supabase.co/storage/v1/object/public/damage-images/testing";

export function buildImagePublicUrl(kundenNr: number): string {
	// gemäss Vorgabe: {prefix}/{kundennummer}.jpeg
	return `${SUPABASE_PUBLIC_PREFIX}/${kundenNr}.jpg`;
}

export function buildImageId(kundenNr: number): string {
	// Vorgabe imageId: "testing/ kundennummer,jpg" (interpretiert als path "testing/{kundenNr}.jpg")
	return `testing/${kundenNr}.jpg`;
}
