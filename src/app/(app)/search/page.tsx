import { Search } from "lucide-react";

export default function SearchPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="card p-8 text-center">
        <Search size={32} className="mx-auto text-muted" />
        <h1 className="mt-3 text-lg font-bold">Search</h1>
        <p className="mt-1 text-sm text-muted">Coming soon</p>
      </div>
    </div>
  );
}
