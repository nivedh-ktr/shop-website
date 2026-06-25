export interface Product {
  id: number;
  name: string;
  desc: string;
  price: string;
  priceValue: number;
  image: string;
  images?: string[];
  oldPrice?: string;
  tags?: string[];
  sku?: string;
  category?: string;
  sizes?: string[];
  colors?: { name: string; hex: string }[];
}

export const products: Product[] = [
  { 
    id: 1, 
    name: "Syltherine", 
    desc: "Stylish cafe chair", 
    price: "₹25,00,000", 
    priceValue: 2500000,
    image: "https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&q=80"
    ],
    tags: ["Best Sellers", "New Arrivals"],
    sku: "SS001",
    category: "Sofas",
    sizes: ["L", "XL", "XS"],
    colors: [{ name: "Purple", hex: "#816DFA" }, { name: "Black", hex: "#000000" }, { name: "Gold", hex: "#B88E2F" }]
  },
  { 
    id: 2, 
    name: "Leviosa", 
    desc: "Stylish cafe chair", 
    price: "₹25,00,000", 
    priceValue: 2500000,
    image: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80"
    ],
    tags: ["Best Sellers"],
    sku: "SS002",
    category: "Chairs",
    sizes: ["M", "L"],
    colors: [{ name: "Gold", hex: "#B88E2F" }, { name: "Black", hex: "#000000" }]
  },
  { 
    id: 3, 
    name: "Lolito", 
    desc: "Luxury big sofa", 
    price: "₹70,00,000", 
    priceValue: 7000000,
    oldPrice: "Rp 14.000.000", 
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80"
    ],
    tags: ["Limited Edition", "Designer Picks"],
    sku: "SS003",
    category: "Sofas",
    sizes: ["XL"],
    colors: [{ name: "Gray", hex: "#A9A9A9" }]
  },
  { 
    id: 4, 
    name: "Respira", 
    desc: "Outdoor bar table and stool", 
    price: "₹50,00,000", 
    priceValue: 5000000,
    image: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80"
    ],
    tags: ["New Arrivals"],
    sku: "SS004",
    category: "Outdoor",
    sizes: ["Standard"],
    colors: [{ name: "Brown", hex: "#8B4513" }]
  },
  { 
    id: 5, 
    name: "Griffo", 
    desc: "Night lamp", 
    price: "₹15,00,000", 
    priceValue: 1500000,
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1513506003901-1e6a229e9d15?auto=format&fit=crop&q=80"
    ],
    tags: ["New Arrivals", "Best Sellers"],
    sku: "SS005",
    category: "Lighting",
    sizes: ["S"],
    colors: [{ name: "Black", hex: "#000000" }]
  },
  { 
    id: 6, 
    name: "Muggo", 
    desc: "Small mug", 
    price: "₹1,50,000", 
    priceValue: 150000,
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&q=80"
    ],
    tags: ["Best Sellers"],
    sku: "SS006",
    category: "Accessories",
    sizes: ["S"],
    colors: [{ name: "White", hex: "#FFFFFF" }]
  },
  { 
    id: 7, 
    name: "Pingky", 
    desc: "Cute bed set", 
    price: "₹70,00,000", 
    priceValue: 7000000,
    oldPrice: "Rp 14.000.000",
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80"
    ],
    tags: ["Designer Picks", "Limited Edition"],
    sku: "SS007",
    category: "Beds",
    sizes: ["King", "Queen"],
    colors: [{ name: "Pink", hex: "#FFC0CB" }]
  },
  { 
    id: 8, 
    name: "Potty", 
    desc: "Minimalist flower pot", 
    price: "₹5,00,000", 
    priceValue: 500000,
    image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80"
    ],
    tags: ["New Arrivals"],
    sku: "SS008",
    category: "Accessories",
    sizes: ["S"],
    colors: [{ name: "Concrete", hex: "#C0C0C0" }]
  }
];
