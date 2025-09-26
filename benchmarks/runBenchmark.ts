/*
 Benchmark Script
 Steps:
 1. CSV laden (../data/Versicherungsdaten.csv)
 2. Relevante Zeilen für testcases (Kunden-Nr.) filtern
 3. Request-Body für jeden Fall an POST http://localhost:3000/api/cases senden
    Neuer Body Schema (UploadDamageImageSubmitPayload):
      {
        description: string,
        category: string,
        case_images: [ { imageId: string, publicUrl: string } ],
        saveToDb?: boolean   // ACHTUNG: Frontend-Typ benutzt saveToDb (kleines b);
                             // Backend mappt body.saveToDb -> internal saveToDB.
      }
 4. Antwort enthält (erwartet) ein Feld estimate (oder ähnlich) – hier angenommen: response.estimate
 5. Vergleich mit historischem Wert (TOTAL SCHADENAUFWAND) -> Fehler (%) pro Fall
 6. Standardabweichung der Fehler (%), mittlerer absoluter Fehler (%), MAPE
 7. Optionaler JSON-Report (--report <pfad>)
*/

import { createReadStream } from 'fs';
import { resolve } from 'path';
import { parse } from 'csv-parse';
import fetch from 'node-fetch';
import { buildImageId, buildImagePublicUrl, testcases } from './testcases.js';

import { readdir } from 'fs/promises';
import { join, resolve as resolvePath } from 'path';
import { pathToFileURL } from 'url';

// ADD: local image root (folder "data" contains all files; images are under data/<FOLDER>)
const LOCAL_IMAGE_ROOT = resolvePath(process.cwd(), '../data');


interface CsvRowRaw {
  Hergang: string;
  'Fotos?': string;
  'Kunden-Nr.': string;
  SPARTE: string;
  CLAIMSTATUS: string;
  'TOTAL SCHADENAUFWAND': string;
}

interface CaseBenchmarkInput {
  kundenNr: number;
  description: string;
  category: string | null;
  historicalAmount: number | null;
  caseImages: CaseImage[];
}

interface CaseImage {
  publicUrl: string;
  imageId: string;
}

interface CaseBenchmarkResult extends CaseBenchmarkInput {
  apiAmount: number | null;
  errorPct: number | null; // (api - hist)/hist * 100
}

function parseAmount(val: string | undefined): number | null {
  if (!val) return null;
  const trimmed = val.replace(/\s/g, '').replace(',', '.');
  if (trimmed === '' || trimmed === '-') return null;
  const num = Number(trimmed);
  return Number.isFinite(num) ? num : null;
}

async function loadCsv(): Promise<CsvRowRaw[]> {
  const file = resolve(process.cwd(), '../data/Versicherungsdaten.csv');
  return new Promise((resolvePromise, reject) => {
    const rows: CsvRowRaw[] = [];
    createReadStream(file)
      .pipe(
        parse({
          delimiter: ';',
          columns: true,
          skip_empty_lines: true,
          relax_column_count: true,
          trim: true,
        })
      )
      .on('data', (rec: CsvRowRaw) => rows.push(rec))
      .on('error', reject)
      .on('end', () => resolvePromise(rows));
  });
}

async function buildBenchmarkInputs(rows: CsvRowRaw[]): Promise<CaseBenchmarkInput[]> {
  const wantedIds = new Set(testcases.map(t => t.id));
  const candidates = rows.map(async r => {
    const kundenNr = Number(r['Kunden-Nr.']);
    if (!Number.isFinite(kundenNr)) return null;

    return {
      kundenNr,
      description: r.Hergang?.trim() ?? '',
      category: r.SPARTE?.trim() || null,
      historicalAmount: parseAmount(r['TOTAL SCHADENAUFWAND']),
      caseImages: await buildCaseImages(kundenNr), // CHANGED
    } as CaseBenchmarkInput;
  });

  const resolved = await Promise.all(candidates);
  return resolved.filter((r): r is CaseBenchmarkInput => !!r && wantedIds.has(r.kundenNr));
}

async function buildCaseImages(kundenNr: number): Promise<CaseImage[]> {
  const files = await listCustomerImages(kundenNr);
  return files.map(name => {

    const match = name.match(/^(\d+)(?: - (\d+))?\.(?:jpe?g)$/i);
    if (!match) throw new Error(`Unexpected filename format: ${name}`);
    const index = match[2] ? parseInt(match[2], 10) : 0;

    return {
      imageId: buildImageId(kundenNr, index),
      publicUrl: buildImagePublicUrl(kundenNr, index),
    };
  });
}


async function callApi(entry: CaseBenchmarkInput): Promise<number | null> {
  try {
    const res = await fetch('http://localhost:3000/api/cases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description: entry.description,
        category: entry.category ?? '',
        case_images: entry.caseImages,
        // Wichtig: damit wir keine DB Writes auslösen (Benchmark), korrektes Feld nach Frontend-Typ:
        saveToDb: false,
      }),
    });
    if (!res.ok) {
      console.error(`API Fehler ${res.status} für KundenNr ${entry.kundenNr}`);
      return null;
    }
    const json: any = await res.json();
    // Erwartet: json.estimate oder json.amount etc. – wir versuchen mehrere Felder.
    const num = Number(json.estimation);
    return Number.isFinite(num) ? num : null;
  } catch (e) {
    console.error('API Call Exception', entry.kundenNr, e);
    return null;
  }
}

function computeStats(results: CaseBenchmarkResult[]) {
  const withBoth = results.filter(r => r.historicalAmount != null && r.apiAmount != null && r.errorPct != null);
  if (withBoth.length === 0) {
    return { count: 0, meanErrorPct: null, stdDevErrorPct: null, mape: null };
  }
  const errors = withBoth.map(r => r.errorPct!); // signed
  const absPercents = withBoth.map(r => Math.abs(r.errorPct!));
  const meanErrorPct = errors.reduce((a, b) => a + b, 0) / errors.length;
  const variance = errors.reduce((a, b) => a + Math.pow(b - meanErrorPct, 2), 0) / errors.length;
  const stdDevErrorPct = Math.sqrt(variance);
  // MAPE = mean absolute percentage error (|api - hist|/hist * 100)
  const mape = absPercents.reduce((a, b) => a + b, 0) / absPercents.length;
  return { count: withBoth.length, meanErrorPct, stdDevErrorPct, mape };
}

async function main() {
  console.log('Lade CSV...');
  const rows = await loadCsv();
  console.log(`CSV Zeilen gesamt: ${rows.length}`);
  const inputs = await buildBenchmarkInputs(rows);
  console.log(`Gefilterte Testfälle: ${inputs.length}`);

  const parallel = Number(process.env.BENCH_PARALLEL || '1');
  const queue = [...inputs];
  const results: CaseBenchmarkResult[] = [];

  async function worker() {
    while (queue.length > 0) {
      const entry = queue.shift();
      if (!entry) break;
      const apiAmount = await callApi(entry);
      const errorPct = entry.historicalAmount != null && apiAmount != null && entry.historicalAmount !== 0
        ? ((apiAmount - entry.historicalAmount) / entry.historicalAmount) * 100
        : null;
      results.push({ ...entry, apiAmount, errorPct });
      console.log(
        `[Fall ${entry.kundenNr}] hist=${entry.historicalAmount ?? 'n/a'} api=${apiAmount ?? 'n/a'} error%=${errorPct?.toFixed(2) ?? 'n/a'}`
      );
    }
  }

  await Promise.all(Array.from({ length: parallel }, () => worker()));

  const stats = computeStats(results);
  console.log('\n=== Benchmark Zusammenfassung ===');
  console.log(`Fälle mit Vergleich: ${stats.count}`);
  if (stats.count > 0) {
    console.log(`Mittlerer Fehler (signed %): ${stats.meanErrorPct?.toFixed(2)}%`);
    console.log(`Standardabweichung Fehler (%): ${stats.stdDevErrorPct?.toFixed(2)}%`);
    console.log(`MAPE (%): ${stats.mape?.toFixed(2)}%`);
  }

  // Optionaler Report
  const args = process.argv.slice(2);
  const reportIdx = args.indexOf('--report');
  if (reportIdx !== -1 && args[reportIdx + 1]) {
    const fs = await import('fs');
    const reportPath = resolve(process.cwd(), args[reportIdx + 1]);
    const report = { timestamp: new Date().toISOString(), stats, results };
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');
    console.log(`Report geschrieben: ${reportPath}`);
  }
}

async function listCustomerImages(kundenNr: number): Promise<string[]> {
  const dirPath = LOCAL_IMAGE_ROOT; // e.g., data/testing
  const entries = await readdir(dirPath, { withFileTypes: true });

  const rx = new RegExp(`^${kundenNr}(?: - (\\d+))?\\.(jpe?g)$`, 'i');
  const files = entries
    .filter(e => e.isFile())
    .map(e => e.name)
    .filter(name => rx.test(name))
    .sort((a, b) => {
      const ma = a.match(rx)!;
      const mb = b.match(rx)!;
      const ia = ma[1] ? parseInt(ma[1], 10) : 0;
      const ib = mb[1] ? parseInt(mb[1], 10) : 0;
      return ia - ib; // base image first, then - 1, - 2, ...
    });

  return files; // e.g., ["123.jpg", "123 - 1.jpg"]
}


main().catch(e => {
  console.error('Benchmark Fehler', e);
  process.exit(1);
});
