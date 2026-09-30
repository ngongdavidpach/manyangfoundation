export interface Program {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  iconName: string;
  image: string;
  impactStats: string;
  category: "mobility" | "healthcare" | "education" | "livelihood" | "advocacy";
}

export interface SuccessStory {
  id: string;
  name: string;
  age: number;
  location: string;
  title: string;
  story: string;
  quote: string;
  image: string;
  aidType: string;
  date: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  date: string;
  author: string;
  category: string;
  image: string;
  readTime: string;
}

export interface FAQItem {
  question: string;
  answer: string;
  category: "general" | "donations" | "assistance" | "volunteering";
}

export interface GalleryImage {
  id: string;
  title: string;
  location: string;
  category: "mobility" | "medical" | "education" | "livelihood";
  url: string;
  date: string;
  description: string;
}

export interface FoundationEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  type: "upcoming" | "past";
  category: string;
  description: string;
  image: string;
  registrationLink?: string;
  seatsAvailable?: number;
}

export interface ImpactMetric {
  id: string;
  label: string;
  value: string;
  icon: string;
}

// Foundation info - admin can override via page_settings in /admin
export const FOUNDATION_INFO = {
  name: "Manyang Disability Foundation",
  shortName: "MDF",
  tagline: "Empowering Abilities, Restoring Dignity, Transforming Lives",
  mission:
    "To provide essential mobility aids, comprehensive healthcare access, inclusive education, and sustainable livelihood opportunities to vulnerable individuals and persons with disabilities, ensuring they live with utmost dignity and independence.",
  vision:
    "A fully inclusive society where individuals of all abilities have barrier-free access to opportunities, active community involvement, and the resources to achieve their maximum potential.",
  email: "info@manyangdisabilityfoundation.org",
  phone: "+1 (555) 382-9104",
  altPhone: "+237 670 123 456",
  address: "MDF Headquarters, Inclusion Plaza, Suite 400",
  workingHours: "Monday - Friday: 8:00 AM - 5:00 PM",
  socials: {
    facebook: "",
    twitter: "",
    linkedin: "",
    instagram: "",
  },
};

// Live content lives in Supabase tables (news_articles, events, staff_members,
// media_assets) and the `page_settings` row keyed `foundation` (managed via the
// admin "Foundation Info" editor). The type exports above remain for components
// that still rely on the shapes.

