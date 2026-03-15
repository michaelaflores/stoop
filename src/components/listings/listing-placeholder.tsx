import { ListingCategory } from "@/lib/supabase/types";

const CATEGORY_IMAGES: Record<ListingCategory, string> = {
  tools: "/fallbacks/tools.png",
  kitchen: "/fallbacks/kitchen.png",
  outdoor: "/fallbacks/outdoor.png",
  recreation: "/fallbacks/recreation.png",
  household: "/fallbacks/household.png",
  electronics: "/fallbacks/electronics.png",
  skill_handyman: "/fallbacks/skill-handyman.png",
  skill_tutoring: "/fallbacks/skill-tutoring.png",
  skill_pet: "/fallbacks/skill-pet.png",
  skill_tech: "/fallbacks/skill-tech.png",
  skill_other: "/fallbacks/skill-other.png",
};

interface ListingPlaceholderProps {
  category: ListingCategory;
  className?: string;
}

export function ListingPlaceholder({ category, className = "" }: ListingPlaceholderProps) {
  const src = CATEGORY_IMAGES[category] ?? CATEGORY_IMAGES.tools;
  return (
    <img
      src={src}
      alt={`${category.replace(/_/g, " ")} placeholder`}
      className={`object-cover ${className}`}
    />
  );
}
