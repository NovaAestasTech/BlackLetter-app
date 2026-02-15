export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
}
export const TEMPLATES = [
  {
    id: "1",
    name: "Service Agreement",
    category: "Commercial",
    description: "Standard service agreement template for B2B services",
    color: "from-blue-500 to-blue-600",
    icon: "📋",
  },
  {
    id: "2",
    name: "NDA",
    category: "Legal",
    description: "Non-Disclosure Agreement for confidential information",
    color: "from-purple-500 to-purple-600",
    icon: "🔒",
  },
  {
    id: "3",
    name: "Employment Contract",
    category: "HR",
    description: "Full-time employment contract template",
    color: "from-emerald-500 to-emerald-600",
    icon: "👔",
  },
  {
    id: "4",
    name: "Independent Contractor Agreement",
    category: "Legal",
    description: "Agreement for independent contractors and freelancers",
    color: "from-orange-500 to-orange-600",
    icon: "🤝",
  },
  {
    id: "5",
    name: "Terms of Service",
    category: "Legal",
    description: "Standard terms of service for digital products",
    color: "from-red-500 to-red-600",
    icon: "⚖️",
  },
  {
    id: "6",
    name: "Vendor Agreement",
    category: "Commercial",
    description: "Agreement template for vendor relationships",
    color: "from-indigo-500 to-indigo-600",
    icon: "🏢",
  },
];
