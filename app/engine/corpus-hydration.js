/**
 * TD613-TCP Corpus Hydration Engine
 * Responsible for strictly fetching and deeply freezing the unified corpus manifest
 * into global state without mutating, truncating, or sanitizing the payload.
 */

// Deep freeze utility to ensure strict read-only state throughout the nested corpus
function deepFreeze(object) {
  const propNames = Object.getOwnPropertyNames(object);
  for (const name of propNames) {
    const value = object[name];
    if (value && typeof value === "object") {
      deepFreeze(value);
    }
  }
  return Object.freeze(object);
}

export async function hydrateCorpus() {
  if (window.TD613_CORPUS_STATE) {
    return window.TD613_CORPUS_STATE; // Already hydrated
  }

  try {
    // Note: Path relies on the server root configuration in development/production
    const response = await fetch('/app/safe-harbor/corpus/TD613_corpus_manifest.json');
    if (!response.ok) {
      throw new Error(`Failed to fetch corpus manifest: ${response.status} ${response.statusText}`);
    }

    // Retrieve raw text to guarantee exact byte stream integrity prior to parsing
    const rawText = await response.text();

    // Strict parsing (native JSON.parse handles full UTF-8 byte integrity by default,
    // ensuring no whitespace, boundaries, or non-standard glyphs are stripped).
    const parsedCorpus = JSON.parse(rawText);

    // Deeply freeze the parsed object to guarantee read-only global state
    window.TD613_CORPUS_STATE = deepFreeze(parsedCorpus);

    console.log(`[Hydration Engine] Loaded ${parsedCorpus.total_nodes} nodes from ${parsedCorpus.total_batches} batches.`);
    return window.TD613_CORPUS_STATE;
  } catch (err) {
    console.error('[Hydration Engine] CRITICAL: Corpus hydration failed.', err);
    // Depending on architecture, we might want to throw to halt the boot sequence.
    throw err;
  }
}
