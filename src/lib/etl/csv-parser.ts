import fs from "fs";
import path from "path";

export interface CsvRow {
  [key: string]: string;
}

export function parseCsv(filePath: string): CsvRow[] {
  const raw = fs.readFileSync(filePath, "utf-8");
  const rows: CsvRow[] = [];

  let currentLine = "";
  let inQuotes = false;
  let headerParsed = false;
  let headers: string[] = [];

  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    const nextCh = raw[i + 1];

    if (ch === '"') {
      inQuotes = !inQuotes;
      currentLine += ch;
    } else if (ch === "\n" && !inQuotes) {
      if (currentLine.trim().length === 0) {
        currentLine = "";
        continue;
      }

      if (!headerParsed) {
        headers = parseLine(currentLine.replace(/^\uFEFF/, ""));
        headerParsed = true;
      } else {
        const values = parseLine(currentLine);
        if (values.length >= headers.length) {
          const row: CsvRow = {};
          for (let j = 0; j < headers.length; j++) {
            row[headers[j]] = (values[j] || "").trim();
          }
          rows.push(row);
        }
      }

      currentLine = "";
    } else {
      currentLine += ch;
    }
  }

  // Handle last line if no trailing newline
  if (currentLine.trim().length > 0 && headerParsed) {
    const values = parseLine(currentLine);
    if (values.length >= headers.length) {
      const row: CsvRow = {};
      for (let j = 0; j < headers.length; j++) {
        row[headers[j]] = (values[j] || "").trim();
      }
      rows.push(row);
    }
  }

  return rows;
}

function parseLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

export function getDataDir(): string {
  const possiblePaths = [
    path.join(process.cwd(), "dados_siconfi_3550100"),
    "/home/muril/GovInsight/dados_siconfi_3550100",
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }

  return possiblePaths[0];
}
