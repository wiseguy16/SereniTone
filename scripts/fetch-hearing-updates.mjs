import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const outputPath = path.join(rootDir, "src", "data", "hearingHealthUpdates.json");

const SEARCH_TERM =
  '("tinnitus"[Title/Abstract] OR "hearing loss"[Title/Abstract] OR "hearing health"[Title/Abstract] OR "auditory"[Title/Abstract])';

const MEDLINEPLUS_PROBLEM_CODE_SYSTEM = "2.16.840.1.113883.6.90";
const MEDLINEPLUS_TOPICS = [
  {
    id: "medlineplus-tinnitus",
    code: "H93.19",
    fallbackTitle: "Understanding tinnitus",
    fallbackLink: "https://medlineplus.gov/tinnitus.html",
    fallbackSummary:
      "Patient-friendly overview of tinnitus symptoms, causes, treatments, and ways to cope with ringing or internal sound.",
    type: "Patient guide",
  },
  {
    id: "medlineplus-hearing-loss",
    code: "H91.90",
    fallbackTitle: "Understanding hearing loss",
    fallbackLink: "https://medlineplus.gov/hearingdisordersanddeafness.html",
    fallbackSummary:
      "Patient-friendly overview of hearing disorders, hearing loss, and related care and support options.",
    type: "Patient guide",
  },
];

function inferUpdateType(title) {
  const lowerTitle = title.toLowerCase();

  if (lowerTitle.includes("tinnitus")) {
    return "Tinnitus research";
  }

  if (lowerTitle.includes("hearing loss") || lowerTitle.includes("hearing")) {
    return "Hearing-health research";
  }

  return "Auditory research";
}

function buildSummary(item) {
  const journal = item.fulljournalname || "PubMed";
  const type = inferUpdateType(item.title);
  return `${type} indexed by PubMed in ${journal}.`;
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "SereniTone hearing-health updater",
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function loadExistingData() {
  try {
    const existing = await fs.readFile(outputPath, "utf8");
    return JSON.parse(existing);
  } catch {
    return {
      updatedAt: null,
      source: "PubMed + MedlinePlus",
      items: [],
    };
  }
}

function firstString(value) {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return firstString(value[0]);
  }

  if (value && typeof value === "object") {
    return (
      value._value ??
      value.label ??
      value.href ??
      value.value ??
      null
    );
  }

  return null;
}

function extractMedlinePlusEntry(json) {
  const entry = json?.feed?.entry;
  const firstEntry = Array.isArray(entry) ? entry[0] : entry;

  if (!firstEntry) {
    return null;
  }

  const link = Array.isArray(firstEntry.link) ? firstEntry.link[0]?.href : firstEntry.link?.href;

  return {
    title: firstString(firstEntry.title),
    link: link || firstString(firstEntry.link),
    summary: firstString(firstEntry.summary),
    sourceDetail: firstString(firstEntry.rights) || "MedlinePlus",
  };
}

async function fetchPubMedUpdates() {
  const searchUrl =
    "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi" +
    `?db=pubmed&retmode=json&retmax=6&sort=pub+date&term=${encodeURIComponent(SEARCH_TERM)}`;

  const searchResults = await fetchJson(searchUrl);
  const ids = searchResults?.esearchresult?.idlist ?? [];

  if (ids.length === 0) {
    return [];
  }

  const summaryUrl =
    "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi" +
    `?db=pubmed&retmode=json&id=${ids.join(",")}`;

  const summaryResults = await fetchJson(summaryUrl);

  return ids
    .map((id) => summaryResults?.result?.[id])
    .filter(Boolean)
    .map((item) => ({
      id: item.uid,
      title: item.title,
      link: `https://pubmed.ncbi.nlm.nih.gov/${item.uid}/`,
      source: "PubMed",
      sourceDetail: item.fulljournalname || "PubMed-indexed journal",
      publishedAt: item.pubdate || "Date unavailable",
      type: inferUpdateType(item.title),
      summary: buildSummary(item),
      cta: "Read on PubMed",
    }));
}

async function fetchMedlinePlusTopic(topic) {
  const url =
    "https://connect.medlineplus.gov/service" +
    `?mainSearchCriteria.v.cs=${MEDLINEPLUS_PROBLEM_CODE_SYSTEM}` +
    `&mainSearchCriteria.v.c=${encodeURIComponent(topic.code)}` +
    "&knowledgeResponseType=application/json" +
    "&informationRecipient.languageCode.c=en";

  try {
    const json = await fetchJson(url);
    const entry = extractMedlinePlusEntry(json);

    return {
      id: topic.id,
      title: entry?.title || topic.fallbackTitle,
      link: entry?.link || topic.fallbackLink,
      source: "MedlinePlus",
      sourceDetail: "MedlinePlus patient information",
      publishedAt: null,
      type: topic.type,
      summary: entry?.summary || topic.fallbackSummary,
      cta: "Read on MedlinePlus",
    };
  } catch {
    return {
      id: topic.id,
      title: topic.fallbackTitle,
      link: topic.fallbackLink,
      source: "MedlinePlus",
      sourceDetail: "MedlinePlus patient information",
      publishedAt: null,
      type: topic.type,
      summary: topic.fallbackSummary,
      cta: "Read on MedlinePlus",
    };
  }
}

async function fetchMedlinePlusUpdates() {
  return Promise.all(MEDLINEPLUS_TOPICS.map(fetchMedlinePlusTopic));
}

function mixItems(researchItems, patientItems) {
  const mixed = [];
  const maxLength = Math.max(researchItems.length, patientItems.length);

  for (let index = 0; index < maxLength; index += 1) {
    if (patientItems[index]) {
      mixed.push(patientItems[index]);
    }

    if (researchItems[index]) {
      mixed.push(researchItems[index]);
    }
  }

  return mixed.slice(0, 6);
}

async function writeOutput(data) {
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

async function main() {
  const existingData = await loadExistingData();

  try {
    const [researchItems, patientItems] = await Promise.all([
      fetchPubMedUpdates(),
      fetchMedlinePlusUpdates(),
    ]);
    const items = mixItems(researchItems, patientItems);
    const output = {
      updatedAt: new Date().toISOString(),
      source: "PubMed + MedlinePlus",
      items,
    };

    await writeOutput(output);
    console.log(`Fetched ${items.length} hearing-health updates.`);
  } catch (error) {
    console.warn("Failed to refresh hearing-health updates. Keeping existing data.");
    console.warn(error instanceof Error ? error.message : String(error));
    await writeOutput(existingData);
  }
}

main();
