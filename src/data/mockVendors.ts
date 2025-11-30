export interface VendorOption {
  id: number;
  name: string;           // Vendor name
  price: string;          // e.g., "€24,000"
  delivery: string;       // e.g., "14 Days"
  quality_score: number;  // 1-5
  badges: string[];       // e.g., ["AI Pick", "Best Quality"]
  reasoning: string;      // AI's explanation
}

export const MOCK_RESULTS: VendorOption[] = [
  {
    id: 1,
    name: "Dunkler Premium",
    price: "€24,000",
    delivery: "14 Days",
    quality_score: 5,
    badges: ["AI Pick", "Best Quality"],
    reasoning: "Highest cost, but 3-year warranty saves €5k long term."
  },
  {
    id: 2,
    name: "QuickCaffe Ltd",
    price: "€18,500",
    delivery: "3 Days",
    quality_score: 3,
    badges: ["Fastest"],
    reasoning: "Can deliver by Friday, but lower machine lifespan."
  },
  {
    id: 3,
    name: "Berlin Roasters",
    price: "€21,000",
    delivery: "7 Days",
    quality_score: 4,
    badges: ["Balanced"],
    reasoning: "Solid middle ground with local Munich support."
  },
  {
    id: 4,
    name: "Global Imports Co",
    price: "€16,000",
    delivery: "45 Days",
    quality_score: 3,
    badges: ["Lowest Price"],
    reasoning: "Significantly cheaper, but shipping from overseas risks delays."
  },
  {
    id: 5,
    name: "TechBarista Solutions",
    price: "€26,500",
    delivery: "5 Days",
    quality_score: 5,
    badges: ["Premium Service"],
    reasoning: "Includes IoT tracking module and 24/7 support."
  }
];
