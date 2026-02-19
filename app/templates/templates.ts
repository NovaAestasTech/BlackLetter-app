export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
}
export const TEMPLATES = [
  {
    id: "1",
    name: "DEED OF PARTNERSHIP.pdf",
    category: "Commercial",
    description:
      "Legal document defining the rights and liabilities of partners in a business venture.",
    color: "from-cyan-500 to-cyan-600",
    icon: "🤝",
  },
  {
    id: "2",
    name: "PROFESSIONAL SERVICES AGREEMENT.pdf",
    category: "Commercial",
    description:
      "Contractual agreement between a service provider and a client for expert services.",
    color: "from-blue-600 to-indigo-700",
    icon: "📜",
  },
  {
    id: "3",
    name: "PECIAL LEAVE PETITION.pdf",
    category: "Legal",
    description:
      "Legal petition seeking special permission to appeal against any judgment or order.",
    color: "from-zinc-600 to-zinc-700",
    icon: "⚖️",
  },
];
