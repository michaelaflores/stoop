import { Suspense } from "react";
import { SearchForm } from "./search-form";

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <h1 className="mb-4 text-lg font-bold font-display">
        Neighborhood Memory
      </h1>
      <Suspense>
        <SearchForm />
      </Suspense>
    </div>
  );
}
