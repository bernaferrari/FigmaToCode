import fs from "fs";
import path from "path";

const SNAPSHOTS_DIR = path.join(__dirname, "..", "snapshots");

export interface SnapshotResult {
  status: "match" | "mismatch" | "new";
  existingPath?: string;
  newPath?: string;
  expected?: string;
  actual?: string;
}

function getSnapshotPath(
  fixtureName: string,
  framework: string,
  mode: string,
  extension: string,
  isNew: boolean = false
): string {
  const frameworkDir = path.join(SNAPSHOTS_DIR, framework.toLowerCase());
  const filename = `${fixtureName}-${mode}${isNew ? "-new" : ""}${extension}`;
  return path.join(frameworkDir, filename);
}

function normalizeCode(code: string): string {
  return code
    .replace(/\r\n/g, "\n")
    .replace(/\s+$/gm, "")
    .trim();
}

export function compareSnapshot(
  fixtureName: string,
  framework: string,
  mode: string,
  extension: string,
  generatedCode: string
): SnapshotResult {
  const snapshotPath = getSnapshotPath(
    fixtureName,
    framework,
    mode,
    extension,
    false
  );
  const newSnapshotPath = getSnapshotPath(
    fixtureName,
    framework,
    mode,
    extension,
    true
  );

  // Ensure framework directory exists
  const frameworkDir = path.dirname(snapshotPath);
  if (!fs.existsSync(frameworkDir)) {
    fs.mkdirSync(frameworkDir, { recursive: true });
  }

  // Case 1: No existing snapshot - create new
  if (!fs.existsSync(snapshotPath)) {
    fs.writeFileSync(newSnapshotPath, generatedCode, "utf-8");
    return {
      status: "new",
      newPath: newSnapshotPath,
      actual: generatedCode,
    };
  }

  // Case 2: Existing snapshot - compare
  const existingSnapshot = fs.readFileSync(snapshotPath, "utf-8");

  if (normalizeCode(existingSnapshot) === normalizeCode(generatedCode)) {
    // Clean up any stale -new files
    if (fs.existsSync(newSnapshotPath)) {
      fs.unlinkSync(newSnapshotPath);
    }
    return {
      status: "match",
      existingPath: snapshotPath,
    };
  }

  // Case 3: Mismatch - write new file
  fs.writeFileSync(newSnapshotPath, generatedCode, "utf-8");
  return {
    status: "mismatch",
    existingPath: snapshotPath,
    newPath: newSnapshotPath,
    expected: existingSnapshot,
    actual: generatedCode,
  };
}
