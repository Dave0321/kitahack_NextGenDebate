// The 17 United Nations Sustainable Development Goals
// (Note: The spec says 18 but the UN has 17 official SDGs)

export interface SDGGoal {
  id: number;
  name: string;
  shortName: string;
  description: string;
  color: string;
}

export const SDG_GOALS: SDGGoal[] = [
  {
    id: 1,
    name: "No Poverty",
    shortName: "No Poverty",
    description:
      "End poverty in all its forms everywhere. More than 700 million people still live in extreme poverty and are struggling to fulfil the most basic needs.",
    color: "#E5243B",
  },
  {
    id: 2,
    name: "Zero Hunger",
    shortName: "Zero Hunger",
    description:
      "End hunger, achieve food security and improved nutrition and promote sustainable agriculture.",
    color: "#DDA63A",
  },
  {
    id: 3,
    name: "Good Health and Well-Being",
    shortName: "Health",
    description:
      "Ensure healthy lives and promote well-being for all at all ages.",
    color: "#4C9F38",
  },
  {
    id: 4,
    name: "Quality Education",
    shortName: "Education",
    description:
      "Ensure inclusive and equitable quality education and promote lifelong learning opportunities for all.",
    color: "#C5192D",
  },
  {
    id: 5,
    name: "Gender Equality",
    shortName: "Gender Equality",
    description:
      "Achieve gender equality and empower all women and girls.",
    color: "#FF3A21",
  },
  {
    id: 6,
    name: "Clean Water and Sanitation",
    shortName: "Clean Water",
    description:
      "Ensure availability and sustainable management of water and sanitation for all.",
    color: "#26BDE2",
  },
  {
    id: 7,
    name: "Affordable and Clean Energy",
    shortName: "Clean Energy",
    description:
      "Ensure access to affordable, reliable, sustainable and modern energy for all.",
    color: "#FCC30B",
  },
  {
    id: 8,
    name: "Decent Work and Economic Growth",
    shortName: "Decent Work",
    description:
      "Promote sustained, inclusive and sustainable economic growth, full and productive employment and decent work for all.",
    color: "#A21942",
  },
  {
    id: 9,
    name: "Industry, Innovation and Infrastructure",
    shortName: "Innovation",
    description:
      "Build resilient infrastructure, promote inclusive and sustainable industrialization and foster innovation.",
    color: "#FD6925",
  },
  {
    id: 10,
    name: "Reduced Inequalities",
    shortName: "Reduced Inequalities",
    description:
      "Reduce inequality within and among countries.",
    color: "#DD1367",
  },
  {
    id: 11,
    name: "Sustainable Cities and Communities",
    shortName: "Sustainable Cities",
    description:
      "Make cities and human settlements inclusive, safe, resilient and sustainable.",
    color: "#FD9D24",
  },
  {
    id: 12,
    name: "Responsible Consumption and Production",
    shortName: "Responsible Consumption",
    description:
      "Ensure sustainable consumption and production patterns.",
    color: "#BF8B2E",
  },
  {
    id: 13,
    name: "Climate Action",
    shortName: "Climate Action",
    description:
      "Take urgent action to combat climate change and its impacts.",
    color: "#3F7E44",
  },
  {
    id: 14,
    name: "Life Below Water",
    shortName: "Life Below Water",
    description:
      "Conserve and sustainably use the oceans, seas and marine resources for sustainable development.",
    color: "#0A97D9",
  },
  {
    id: 15,
    name: "Life on Land",
    shortName: "Life on Land",
    description:
      "Protect, restore and promote sustainable use of terrestrial ecosystems and halt biodiversity loss.",
    color: "#56C02B",
  },
  {
    id: 16,
    name: "Peace, Justice and Strong Institutions",
    shortName: "Peace & Justice",
    description:
      "Promote peaceful and inclusive societies, provide access to justice for all and build effective, accountable institutions.",
    color: "#00689D",
  },
  {
    id: 17,
    name: "Partnerships for the Goals",
    shortName: "Partnerships",
    description:
      "Strengthen the means of implementation and revitalize the global partnership for sustainable development.",
    color: "#19486A",
  },
];

export function getSDGById(id: number): SDGGoal | undefined {
  return SDG_GOALS.find((sdg) => sdg.id === id);
}

export function getSDGsByIds(ids: number[]): SDGGoal[] {
  return ids
    .map((id) => getSDGById(id))
    .filter((sdg): sdg is SDGGoal => sdg !== undefined);
}
