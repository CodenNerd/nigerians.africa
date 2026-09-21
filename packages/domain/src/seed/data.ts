import type { SeedDatabase } from "../types";
import { handcrafted } from "./handcrafted";
import { mergeSeed } from "./merge";
import { enrichSeedVisuals } from "./enrich-visuals";

import places from "./generated/places.json";
import government from "./generated/government.json";
import people from "./generated/people.json";
import budget from "./generated/budget.json";
import vertical from "./generated/vertical.json";

/**
 * Merged public record: handcrafted demo + promoted crawl layers.
 * Crawl never writes here directly — use `pnpm promote-seed`.
 */
export const seed: SeedDatabase = enrichSeedVisuals(
  mergeSeed(
    handcrafted,
    places as Partial<SeedDatabase>,
    government as Partial<SeedDatabase>,
    people as Partial<SeedDatabase>,
    budget as Partial<SeedDatabase>,
    vertical as Partial<SeedDatabase>,
  ),
);
