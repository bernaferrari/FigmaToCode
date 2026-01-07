import { describe, it, expect, beforeAll } from "vitest";
import { loadAllFixtures, FixtureInfo } from "./helpers/fixtureLoader";
import { RENDERER_CONFIGS } from "./helpers/rendererConfig";
import { generateCode } from "./helpers/codeGenerator";
import { compareSnapshot, SnapshotResult } from "./helpers/snapshotManager";

describe("Code Generation Snapshots", () => {
  let fixtures: FixtureInfo[];

  beforeAll(() => {
    fixtures = loadAllFixtures();
  });

  it("should have fixtures to test", () => {
    expect(fixtures.length).toBeGreaterThan(0);
  });

  it("should generate snapshots for all fixtures and modes", async () => {
    const results: {
      fixture: string;
      config: string;
      result: SnapshotResult;
    }[] = [];

    for (const fixture of fixtures) {
      for (const config of RENDERER_CONFIGS) {
        const generatedCode = await generateCode(fixture.data, config);

        const result = compareSnapshot(
          fixture.name,
          config.framework,
          config.mode,
          config.extension,
          generatedCode
        );

        results.push({
          fixture: fixture.name,
          config: `${config.framework}-${config.mode}`,
          result,
        });
      }
    }

    // Report results
    const newSnapshots = results.filter((r) => r.result.status === "new");
    const mismatches = results.filter((r) => r.result.status === "mismatch");
    const matches = results.filter((r) => r.result.status === "match");

    if (newSnapshots.length > 0) {
      console.log("\n[NEW SNAPSHOTS]");
      newSnapshots.forEach((r) => {
        console.log(`  ${r.fixture} / ${r.config}: ${r.result.newPath}`);
      });
      console.log(
        '\nReview and rename files (remove "-new" suffix) to accept.\n'
      );
    }

    if (mismatches.length > 0) {
      console.log("\n[MISMATCHES]");
      mismatches.forEach((r) => {
        console.log(`  ${r.fixture} / ${r.config}:`);
        console.log(`    Existing: ${r.result.existingPath}`);
        console.log(`    New:      ${r.result.newPath}`);
      });
      console.log(
        '\nReview and rename files (remove "-new" suffix) to accept changes.\n'
      );
    }

    if (matches.length > 0) {
      console.log(`\n[MATCHED] ${matches.length} snapshot(s) matched.`);
    }

    // Fail if there are mismatches or new snapshots
    if (mismatches.length > 0) {
      expect.fail(
        `${mismatches.length} snapshot(s) mismatched. Review the -new files and accept if correct.`
      );
    }

    if (newSnapshots.length > 0) {
      expect.fail(
        `${newSnapshots.length} new snapshot(s) created. Review and accept by removing "-new" suffix.`
      );
    }
  });
});
