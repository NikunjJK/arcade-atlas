type GameLink = {
  id: string;
  game_id: string;
  label: string;
  link_type: string;
  url: string;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
};

type Props = {
  gameId: string;
  links: GameLink[];
  createGameLinkAction: (formData: FormData) => Promise<void>;
  updateGameLinkAction: (formData: FormData) => Promise<void>;
  deleteGameLinkAction: (formData: FormData) => Promise<void>;
};

const LINK_TYPES = [
  'steam',
  'play_store',
  'app_store',
  'official',
  'github',
  'itch',
  'epic',
  'other'
];

export default function GameLinkManager({
  gameId,
  links,
  createGameLinkAction,
  updateGameLinkAction,
  deleteGameLinkAction
}: Props) {
  return (
    <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <div>
        <h2 className="text-2xl font-semibold text-slate-950">Game Links</h2>
        <p className="mt-2 text-sm text-slate-600">
          Add store links, official pages, GitHub links, and other external destinations.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        {links.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500">
            No links added yet.
          </div>
        ) : (
          links.map((link) => (
            <div key={link.id} className="rounded-2xl border border-slate-200 p-4">
              <form action={updateGameLinkAction} className="grid gap-4">
                <input type="hidden" name="id" value={link.id} />
                <input type="hidden" name="game_id" value={gameId} />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Label</label>
                    <input
                      name="label"
                      defaultValue={link.label}
                      className="h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none"
                      placeholder="Steam"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Link type</label>
                    <select
                      name="link_type"
                      defaultValue={link.link_type}
                      className="h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none"
                    >
                      {LINK_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">URL</label>
                  <input
                    name="url"
                    defaultValue={link.url}
                    className="h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none"
                    placeholder="https://store.steampowered.com/..."
                    required
                  />
                </div>

                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
                  <input type="checkbox" name="is_primary" value="true" defaultChecked={link.is_primary} />
                  Primary link
                </label>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    className="h-11 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white"
                  >
                    Save link
                  </button>
                </div>
              </form>

              <form action={deleteGameLinkAction} className="mt-3">
                <input type="hidden" name="id" value={link.id} />
                <input type="hidden" name="game_id" value={gameId} />

                <button
                  type="submit"
                  className="h-11 rounded-2xl border border-red-200 px-5 text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  Delete link
                </button>
              </form>
            </div>
          ))
        )}
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 p-4">
        <h3 className="text-lg font-semibold text-slate-950">Add New Link</h3>

        <form action={createGameLinkAction} className="mt-4 grid gap-4">
          <input type="hidden" name="game_id" value={gameId} />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Label</label>
              <input
                name="label"
                className="h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none"
                placeholder="Steam"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Link type</label>
              <select
                name="link_type"
                defaultValue="other"
                className="h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none"
              >
                {LINK_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">URL</label>
            <input
              name="url"
              className="h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none"
              placeholder="https://..."
              required
            />
          </div>

          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
            <input type="checkbox" name="is_primary" value="true" />
            Primary link
          </label>

          <div>
            <button
              type="submit"
              className="h-12 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white"
            >
              Add link
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}