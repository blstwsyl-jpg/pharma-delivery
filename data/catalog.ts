export type Category = "الأدوية" | "العناية بالبشرة" | "الفيتامينات" | "الأم والطفل";

export type Product = {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  category: Category;
  icon: string;
  color: string;
  requiresPrescription?: boolean;
  badge?: string;
};

export const categories = [
  { id: "all", label: "الكل", icon: "✦" },
  { id: "الأدوية", label: "أدوية", icon: "💊" },
  { id: "الفيتامينات", label: "فيتامينات", icon: "🍊" },
  { id: "العناية بالبشرة", label: "عناية", icon: "✨" },
  { id: "الأم والطفل", label: "الأم والطفل", icon: "🍼" },
] as const;

export const products: Product[] = [
  {
    id: "panadol-extra",
    name: "بنادول إكسترا",
    subtitle: "مسكن للآلام وخافض للحرارة · 24 قرص",
    price: 18.5,
    category: "الأدوية",
    icon: "💊",
    color: "#E5F4F2",
    badge: "الأكثر طلباً",
  },
  {
    id: "vitamin-c",
    name: "فيتامين C 1000",
    subtitle: "دعم المناعة · 20 قرص فوّار",
    price: 32,
    category: "الفيتامينات",
    icon: "🍊",
    color: "#FFF1D7",
    badge: "خصم 15%",
  },
  {
    id: "la-roche",
    name: "لاروش بوزيه",
    subtitle: "واقي شمس +SPF50 للبشرة الحساسة",
    price: 86,
    category: "العناية بالبشرة",
    icon: "🧴",
    color: "#E9E2FF",
  },
  {
    id: "omega-3",
    name: "أوميغا 3",
    subtitle: "زيت السمك النقي · 60 كبسولة",
    price: 59.75,
    category: "الفيتامينات",
    icon: "🫧",
    color: "#DCEBFF",
  },
  {
    id: "baby-care",
    name: "مجموعة العناية بالطفل",
    subtitle: "شامبو ولوشن لطيفان · 2 قطعة",
    price: 74,
    category: "الأم والطفل",
    icon: "🧸",
    color: "#FFE2E9",
    badge: "جديد",
  },
  {
    id: "blood-pressure",
    name: "جهاز قياس الضغط",
    subtitle: "قياس رقمي سريع مع ذاكرة",
    price: 149,
    category: "الأدوية",
    icon: "🩺",
    color: "#E0F5F0",
  },
  {
    id: "moisturizer",
    name: "مرطب سيرافي",
    subtitle: "ترطيب عميق للبشرة الجافة · 340 مل",
    price: 92,
    category: "العناية بالبشرة",
    icon: "🧴",
    color: "#F5EAD8",
  },
  {
    id: "iron",
    name: "حديد + فوليك",
    subtitle: "مكمل غذائي · 30 كبسولة",
    price: 41.5,
    category: "الفيتامينات",
    icon: "🌿",
    color: "#E4F0DB",
  },
];

export const findProduct = (id: string) => products.find((product) => product.id === id);
