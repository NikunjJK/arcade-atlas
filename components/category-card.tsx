import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Category } from '@/lib/types';

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link href={`/categories/${category.slug}`} className="card-surface group block p-6 transition duration-300 hover:-translate-y-1 hover:border-slate-300">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-950">{category.name}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{category.description}</p>
        </div>
        <div className="rounded-2xl bg-slate-100 p-2 text-slate-500 transition group-hover:bg-slate-950 group-hover:text-white">
          <ArrowUpRight className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{category.gameCount} games</div>
    </Link>
  );
}
