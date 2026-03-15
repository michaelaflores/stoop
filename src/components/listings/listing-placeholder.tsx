import { ListingCategory } from "@/lib/supabase/types";

const CATEGORY_VISUALS: Record<ListingCategory, { emoji: string; gradient: string }> = {
  tools: { emoji: "🔨", gradient: "linear-gradient(135deg, #dcc8b4 0%, #c4a88a 100%)" },
  kitchen: { emoji: "🍳", gradient: "linear-gradient(135deg, #d4c4b0 0%, #c2a88e 100%)" },
  outdoor: { emoji: "🌿", gradient: "linear-gradient(135deg, #bdd0c2 0%, #8fb598 100%)" },
  recreation: { emoji: "🎾", gradient: "linear-gradient(135deg, #c8d4c0 0%, #a8bea0 100%)" },
  household: { emoji: "🏠", gradient: "linear-gradient(135deg, #d8cfc4 0%, #c4b8a8 100%)" },
  electronics: { emoji: "💻", gradient: "linear-gradient(135deg, #c4ccd8 0%, #a8b4c4 100%)" },
  skill_handyman: { emoji: "🔧", gradient: "linear-gradient(135deg, #dcc8b4 0%, #c4a88a 100%)" },
  skill_tutoring: { emoji: "📚", gradient: "linear-gradient(135deg, #d4c8d8 0%, #b8a8c4 100%)" },
  skill_pet: { emoji: "🐕", gradient: "linear-gradient(135deg, #d8d0c0 0%, #c4b8a0 100%)" },
  skill_tech: { emoji: "⚡", gradient: "linear-gradient(135deg, #c4ccd8 0%, #a8b4c4 100%)" },
  skill_other: { emoji: "✨", gradient: "linear-gradient(135deg, #d4ccc0 0%, #c0b4a4 100%)" },
};

interface ListingPlaceholderProps {
  category: ListingCategory;
  className?: string;
}

export function ListingPlaceholder({ category, className = "" }: ListingPlaceholderProps) {
  const visual = CATEGORY_VISUALS[category] ?? CATEGORY_VISUALS.tools;
  return (
    <div
      className={`flex items-center justify-center ${className}`}
      style={{ background: visual.gradient }}
    >
      <span className="text-4xl opacity-60 select-none" role="img" aria-hidden="true">
        {visual.emoji}
      </span>
    </div>
  );
}
