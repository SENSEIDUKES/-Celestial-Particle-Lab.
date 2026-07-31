/** Workshop-only inspection model — not part of the production type system. */
export interface GenerationStage {
  key: string;
  name: string;
  description: string;
  included: boolean;
  tokenEstimate: number;
  sizeChars: number;
  format: "text" | "json";
  content: string;
}
