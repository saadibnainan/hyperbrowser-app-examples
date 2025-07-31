import { Hyperbrowser } from "@hyperbrowser/sdk";

export function getHB() {
  const key = process.env.HYPERBROWSER_API_KEY;
  console.log('API Key available:', !!key);
  if (!key) throw new Error("Missing HYPERBROWSER_API_KEY");
  return new Hyperbrowser({ apiKey: key });
}