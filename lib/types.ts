export type Platform = {
  id: string;
  name: string;
  slug: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  gameCount: number;
};

export type GameLink = {
  label: string;
  type:
    | 'official'
    | 'steam'
    | 'itch'
    | 'epic'
    | 'playstore'
    | 'appstore'
    | 'github'
    | 'browser'
    | 'download'
    | 'trailer';
  url: string;
};

export type Game = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  longDescription: string;
  developer: string;
  publisher: string;
  releaseDate: string;
  priceType: 'Free' | 'Paid';
  releaseType: 'Browser Playable' | 'Official Download' | 'Store Page' | 'Multi-link';
  officialBadge: boolean;
  featured: boolean;
  trending: boolean;
  newArrival: boolean;
  popularity: number;
  categories: string[];
  tags: string[];
  platforms: string[];
  coverImage: string;
  bannerImage: string;
  galleryImages: string[];
  faq: { question: string; answer: string }[];
  systemRequirements?: string[];
  links: GameLink[];
  seoTitle: string;
  seoDescription: string;
};

export type Collection = {
  id: string;
  title: string;
  slug: string;
  description: string;
  gameSlugs: string[];
};
