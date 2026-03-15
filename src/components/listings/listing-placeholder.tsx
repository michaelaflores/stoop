import Image, { type StaticImageData } from "next/image";
import { ListingCategory } from "@/lib/supabase/types";

import toolsImg from "@/assets/fallbacks/tools.png";
import kitchenImg from "@/assets/fallbacks/kitchen.png";
import outdoorImg from "@/assets/fallbacks/outdoor.png";
import recreationImg from "@/assets/fallbacks/recreation.png";
import householdImg from "@/assets/fallbacks/household.png";
import electronicsImg from "@/assets/fallbacks/electronics.png";
import skillHandymanImg from "@/assets/fallbacks/skill-handyman.png";
import skillTutoringImg from "@/assets/fallbacks/skill-tutoring.png";
import skillPetImg from "@/assets/fallbacks/skill-pet.png";
import skillTechImg from "@/assets/fallbacks/skill-tech.png";
import skillOtherImg from "@/assets/fallbacks/skill-other.png";

const CATEGORY_IMAGES: Record<ListingCategory, StaticImageData> = {
  tools: toolsImg,
  kitchen: kitchenImg,
  outdoor: outdoorImg,
  recreation: recreationImg,
  household: householdImg,
  electronics: electronicsImg,
  skill_handyman: skillHandymanImg,
  skill_tutoring: skillTutoringImg,
  skill_pet: skillPetImg,
  skill_tech: skillTechImg,
  skill_other: skillOtherImg,
};

interface ListingPlaceholderProps {
  category: ListingCategory;
  className?: string;
}

export function ListingPlaceholder({ category, className = "" }: ListingPlaceholderProps) {
  const img = CATEGORY_IMAGES[category] ?? CATEGORY_IMAGES.tools;
  return (
    <div className={`relative ${className}`}>
      <Image
        src={img}
        alt={`${category.replace(/_/g, " ")} placeholder`}
        fill
        className="object-cover"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />
    </div>
  );
}
