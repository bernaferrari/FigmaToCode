import fs from "fs";
import path from "path";

const FIXTURES_DIR = path.join(__dirname, "..", "fixtures");

export interface FixtureInfo {
  name: string;
  data: any[];
}

export function loadAllFixtures(): FixtureInfo[] {
  if (!fs.existsSync(FIXTURES_DIR)) {
    fs.mkdirSync(FIXTURES_DIR, { recursive: true });
    return [];
  }

  const files = fs.readdirSync(FIXTURES_DIR).filter((f) => f.endsWith(".json"));

  return files.map((file) => {
    const filePath = path.join(FIXTURES_DIR, file);
    const name = path.basename(file, ".json");
    const rawData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const data = Array.isArray(rawData) ? rawData : [rawData];

    return { name, data };
  });
}
