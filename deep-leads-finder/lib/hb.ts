import { Hyperbrowser } from "@hyperbrowser/sdk";

export function hbClient() {
  const key = process.env.HYPERBROWSER_API_KEY;
  if (!key) throw new Error("Missing HYPERBROWSER_API_KEY");
  return new Hyperbrowser({ apiKey: key });
} 