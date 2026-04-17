import Link from 'next/link';

const filters = {
  Platforms: [
    { label: 'PC', value: 'pc', key: 'platform' },
    { label: 'Mac', value: 'mac', key: 'platform' },
    { label: 'Browser', value: 'browser', key: 'platform' },
    { label: 'Android', value: 'android', key: 'platform' },
    { label: 'iPhone / iPad', value: 'ios', key: 'platform' }
  ],
  Pricing: [
    { label: 'Free', value: 'Free', key: 'price' },
    { label: 'Paid', value: 'Paid', key: 'price' }
  ],
  Sort: [
    { label: 'Newest', value: 'newest', key: 'sort' },
    { label: 'Popularity', value: 'popularity', key: 'sort' },
    { label: 'Featured', value: 'featured', key: 'sort' }
  ]
};

type FilterSidebarProps = {
  currentQuery?: string;
  currentPlatform?: string;
  currentPrice?: string;
  currentSort?: string;
};

function buildBrowseHref({
  q,
  platform,
  price,
  sort
}: {
  q?: string;
  platform?: string;
  price?: string;
  sort?: string;
}) {
  const params = new URLSearchParams();

  if (q) params.set('q', q);
  if (platform) params.set('platform', platform);
  if (price) params.set('price', price);
  if (sort) params.set('sort', sort);

  const queryString = params.toString();
  return queryString ? `/browse?${queryString}` : '/browse';
}

export function FilterSidebar({
  currentQuery,
  currentPlatform,
  currentPrice,
  currentSort
}: FilterSidebarProps) {
  return (
    <aside className="card-surface sticky top-24 h-fit p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
          Filters
        </h3>
        <Link
          href="/browse"
          className="text-sm font-medium text-slate-500 transition hover:text-slate-950"
        >
          Reset
        </Link>
      </div>

      <div className="mt-6 space-y-6">
        {Object.entries(filters).map(([title, items]) => (
          <div key={title}>
            <h4 className="text-sm font-semibold text-slate-900">{title}</h4>

            <div className="mt-3 flex flex-wrap gap-2">
              {items.map((item) => {
                const isActive =
                  (item.key === 'platform' && currentPlatform === item.value) ||
                  (item.key === 'price' && currentPrice === item.value) ||
                  (item.key === 'sort' && currentSort === item.value);

                const href = buildBrowseHref({
                  q: currentQuery,
                  platform:
                    item.key === 'platform'
                      ? currentPlatform === item.value
                        ? undefined
                        : item.value
                      : currentPlatform,
                  price:
                    item.key === 'price'
                      ? currentPrice === item.value
                        ? undefined
                        : item.value
                      : currentPrice,
                  sort:
                    item.key === 'sort'
                      ? currentSort === item.value
                        ? undefined
                        : item.value
                      : currentSort
                });

                return (
                  <Link
                    key={`${title}-${item.value}`}
                    href={href}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                      isActive
                        ? 'border-slate-950 bg-slate-950 text-white'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-950 hover:text-slate-950'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}