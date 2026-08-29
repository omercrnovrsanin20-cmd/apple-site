// Lightweight, fully deterministic heuristic "AI assistance layer".
//
// This project has no external LLM/vision API key configured, so rather than
// fabricate a call to a model (or worse, fabricate confidence/accuracy
// numbers), this module inspects the request's text for keywords and maps
// them to informational, non-binding suggestions. Staff/Owner always make
// the final call -- nothing here writes to the database or changes status.

interface SuggestionInput {
  description?: string | null;
  serviceNameEn: string;
}

export interface AiSuggestions {
  potentialServices: string[];
  possibleConditions: string[];
  note: string;
}

const KEYWORD_SERVICE_MAP: [RegExp, string][] = [
  [/swirl|scratch|dull|oxidi[sz]ed|hologram/i, "Paint Correction"],
  [/coating|protect|hydrophob|glossy|shine long/i, "Ceramic Coating"],
  [/smell|stain|pet hair|upholstery|seat|carpet/i, "Interior Deep Clean"],
  [/bug|tar|sap|bird dropping|road grime|dirty/i, "Exterior Wash & Decontamination"],
  [/everything|full|complete|whole car/i, "Full Detail Package"],
];

const KEYWORD_CONDITION_MAP: [RegExp, string][] = [
  [/swirl|hologram/i, "Visible swirl marks / fine scratches in the clear coat"],
  [/scratch/i, "Visible scratches on the paint surface"],
  [/oxidi[sz]ed|dull|faded/i, "Paint oxidation or loss of gloss"],
  [/stain|spill/i, "Interior staining"],
  [/smell|odor/i, "Interior odor"],
  [/rust/i, "Possible surface rust"],
];

export function generateAiSuggestions({ description, serviceNameEn }: SuggestionInput): AiSuggestions {
  const text = description ?? "";

  const potentialServices = new Set<string>();
  for (const [pattern, service] of KEYWORD_SERVICE_MAP) {
    if (pattern.test(text)) potentialServices.add(service);
  }
  if (potentialServices.size === 0) potentialServices.add(serviceNameEn);

  const possibleConditions = new Set<string>();
  for (const [pattern, condition] of KEYWORD_CONDITION_MAP) {
    if (pattern.test(text)) possibleConditions.add(condition);
  }

  return {
    potentialServices: Array.from(potentialServices),
    possibleConditions: Array.from(possibleConditions),
    note:
      "Generated from keywords in the customer's description. Informational only -- confirm in person before deciding on additional services.",
  };
}
