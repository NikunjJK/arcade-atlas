import { Search } from 'lucide-react';

export function SearchBar({
  placeholder = 'Search games, tags, platforms...',
  action = '/browse',
  defaultValue,
  hiddenFields = {}
}: {
  placeholder?: string;
  action?: string;
  defaultValue?: string;
  hiddenFields?: Record<string, string | undefined>;
}) {
  return (
    <form action={action} className="card-surface flex items-center gap-3 p-2 pr-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        <Search className="h-5 w-5" />
      </div>

      {Object.entries(hiddenFields).map(([key, value]) =>
        value ? <input key={key} type="hidden" name={key} value={value} /> : null
      )}

      <input
        type="text"
        name="q"
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="h-12 w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 sm:text-base"
      />

      <button className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">
        Search
      </button>
    </form>
  );
}