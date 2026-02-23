import type {
  ApiResponse,
  Market,
  MarketSummary,
  OrderBook,
  PagedResponse,
} from "@/types/markets";

export const USE_MOCK_DATA = process.env.USE_MOCK_DATA === "true";

// ---------------------------------------------------------------------------
// Fixture data
// ---------------------------------------------------------------------------

const meta = () => ({ requestId: "mock", timestamp: new Date().toISOString() });

const MARKETS: MarketSummary[] = [
  {
    id: "mock-1",
    slug: "btc-100k-2025",
    title: "Will Bitcoin reach $100k before end of 2025?",
    category: "CRYPTO",
    status: "OPEN",
    closeTime: "2025-12-31T23:59:00Z",
  },
  {
    id: "mock-2",
    slug: "us-recession-2025",
    title: "Will the US enter a recession in 2025?",
    category: "FINANCE",
    status: "OPEN",
    closeTime: "2025-12-31T23:59:00Z",
  },
  {
    id: "mock-3",
    slug: "spacex-mars-2030",
    title: "Will SpaceX land humans on Mars before 2030?",
    category: "SCIENCE",
    status: "OPEN",
    closeTime: "2029-12-31T23:59:00Z",
  },
  {
    id: "mock-4",
    slug: "ai-bar-exam-2024",
    title: "Will an AI model pass the bar exam by end of 2024?",
    category: "SCIENCE",
    status: "SETTLED",
    closeTime: "2024-12-31T23:59:00Z",
  },
  {
    id: "mock-5",
    slug: "euro-2024-host-winner",
    title: "Will the Euro 2024 host country win the tournament?",
    category: "SPORTS",
    status: "SETTLED",
    closeTime: "2024-07-14T22:00:00Z",
  },
];

const MARKET_DETAILS: Record<string, Market> = {
  "mock-1": {
    id: "mock-1",
    slug: "btc-100k-2025",
    title: "Will Bitcoin reach $100k before end of 2025?",
    description:
      "Resolves YES if Bitcoin (BTC/USD) closes above $100,000 on any major exchange before midnight UTC on December 31 2025.",
    category: "CRYPTO",
    status: "OPEN",
    resolutionCriteria:
      "Resolved using the Coinbase BTC/USD daily closing price. A single daily close above $100,000 is sufficient.",
    resolutionSourceUrl: "https://www.coinbase.com/price/bitcoin",
    closeTime: "2025-12-31T23:59:00Z",
    settlementTime: null,
    resolvedOutcome: null,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  "mock-2": {
    id: "mock-2",
    slug: "us-recession-2025",
    title: "Will the US enter a recession in 2025?",
    description:
      "Resolves YES if the NBER officially declares a US recession with a start date in calendar year 2025.",
    category: "FINANCE",
    status: "OPEN",
    resolutionCriteria:
      "Resolved when the NBER Business Cycle Dating Committee publishes an official recession determination referencing 2025.",
    closeTime: "2025-12-31T23:59:00Z",
    settlementTime: null,
    resolvedOutcome: null,
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },
  "mock-3": {
    id: "mock-3",
    slug: "spacex-mars-2030",
    title: "Will SpaceX land humans on Mars before 2030?",
    description:
      "Resolves YES if SpaceX successfully lands a crewed mission on the Martian surface before January 1 2030.",
    category: "SCIENCE",
    status: "OPEN",
    resolutionCriteria:
      "Crew must survive landing and be confirmed on the Martian surface by SpaceX mission control.",
    closeTime: "2029-12-31T23:59:00Z",
    settlementTime: null,
    resolvedOutcome: null,
    createdAt: "2024-02-01T00:00:00Z",
    updatedAt: "2024-02-01T00:00:00Z",
  },
  "mock-4": {
    id: "mock-4",
    slug: "ai-bar-exam-2024",
    title: "Will an AI model pass the bar exam by end of 2024?",
    description: "Resolves YES if any publicly available AI model achieves a passing score on the Uniform Bar Exam.",
    category: "SCIENCE",
    status: "SETTLED",
    resolutionCriteria: "A score of 266 or above on the UBE, verified by a credible third-party source.",
    closeTime: "2024-12-31T23:59:00Z",
    settlementTime: "2024-03-15T12:00:00Z",
    resolvedOutcome: "YES",
    createdAt: "2024-01-10T00:00:00Z",
    updatedAt: "2024-03-15T12:00:00Z",
  },
  "mock-5": {
    id: "mock-5",
    slug: "euro-2024-host-winner",
    title: "Will the Euro 2024 host country win the tournament?",
    description: "Resolves YES if Germany wins UEFA Euro 2024.",
    category: "SPORTS",
    status: "SETTLED",
    resolutionCriteria: "Germany must win the final on July 14 2024.",
    closeTime: "2024-07-14T22:00:00Z",
    settlementTime: "2024-07-14T23:30:00Z",
    resolvedOutcome: "NO",
    createdAt: "2024-01-20T00:00:00Z",
    updatedAt: "2024-07-14T23:30:00Z",
  },
};

const ORDER_BOOKS: Record<string, OrderBook> = {
  "mock-1": {
    marketId: "mock-1",
    bids: [
      { priceCents: 62, totalQuantity: 1500 },
      { priceCents: 60, totalQuantity: 3200 },
      { priceCents: 58, totalQuantity: 800 },
      { priceCents: 55, totalQuantity: 2100 },
    ],
    asks: [
      { priceCents: 65, totalQuantity: 900 },
      { priceCents: 67, totalQuantity: 2400 },
      { priceCents: 70, totalQuantity: 1100 },
      { priceCents: 72, totalQuantity: 600 },
    ],
  },
  "mock-2": {
    marketId: "mock-2",
    bids: [
      { priceCents: 30, totalQuantity: 4000 },
      { priceCents: 28, totalQuantity: 1200 },
      { priceCents: 25, totalQuantity: 700 },
    ],
    asks: [
      { priceCents: 33, totalQuantity: 2200 },
      { priceCents: 35, totalQuantity: 3100 },
      { priceCents: 38, totalQuantity: 900 },
    ],
  },
  "mock-3": {
    marketId: "mock-3",
    bids: [
      { priceCents: 8, totalQuantity: 10000 },
      { priceCents: 7, totalQuantity: 6000 },
    ],
    asks: [
      { priceCents: 12, totalQuantity: 8000 },
      { priceCents: 15, totalQuantity: 4000 },
    ],
  },
};

const FALLBACK_ORDER_BOOK: OrderBook = { marketId: "mock-1", bids: [], asks: [] };

// ---------------------------------------------------------------------------
// Lookup helpers
// ---------------------------------------------------------------------------

/** Returns a fully-wrapped ApiResponse mock payload for a given backend path,
 *  or null if the path is not covered by fixtures. */
export function getMockResponse(path: string): ApiResponse<unknown> | null {
  const [cleanPath, rawQs = ""] = path.split("?");
  const qs = new URLSearchParams(rawQs);

  // Markets list — /api/v1/markets  or  /api/v1/markets/search
  if (cleanPath === "/api/v1/markets" || cleanPath === "/api/v1/markets/search") {
    const status = qs.get("status");
    const category = qs.get("category");
    const q = qs.get("q")?.toLowerCase();

    let filtered = MARKETS;
    if (status) filtered = filtered.filter((m) => m.status === status);
    if (category) filtered = filtered.filter((m) => m.category === category);
    if (q) filtered = filtered.filter((m) => m.title.toLowerCase().includes(q));

    const paged: PagedResponse<MarketSummary> = {
      content: filtered,
      totalElements: filtered.length,
      totalPages: Math.max(1, Math.ceil(filtered.length / 20)),
      page: 0,
      size: 20,
    };
    return { data: paged, meta: meta() };
  }

  // Order book — /api/v1/markets/:id/orders
  const orderBookMatch = cleanPath.match(/^\/api\/v1\/markets\/([^/]+)\/orders$/);
  if (orderBookMatch) {
    const book = ORDER_BOOKS[orderBookMatch[1]] ?? FALLBACK_ORDER_BOOK;
    return { data: book, meta: meta() };
  }

  // Market detail — /api/v1/markets/:id
  const detailMatch = cleanPath.match(/^\/api\/v1\/markets\/([^/]+)$/);
  if (detailMatch) {
    const market = MARKET_DETAILS[detailMatch[1]] ?? MARKET_DETAILS["mock-1"];
    return { data: market, meta: meta() };
  }

  return null;
}
