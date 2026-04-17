'use client';

import { useRef, useState, useTransition } from 'react';

type ExistingImage = {
  id: string;
  image_url: string;
  sort_order: number;
};

type Props = {
  gameId: string;
  existingImages?: ExistingImage[];
  uploadAction: (formData: FormData) => Promise<void>;
};

export default function ScreenshotUploader({
  gameId,
  existingImages = [],
  uploadAction
}: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  function handleFilesChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    setError('');
    setSelectedFiles(files);
  }

  function handleSubmit(formData: FormData) {
    setError('');

    const files = formData.getAll('screenshots') as File[];

    if (!files.length || !files[0] || files[0].size === 0) {
      setError('Please choose at least one image.');
      return;
    }

    const invalidFile = files.find(
      (file) =>
        !['image/png', 'image/jpeg', 'image/webp'].includes(file.type)
    );

    if (invalidFile) {
      setError('Only PNG, JPG, JPEG, and WEBP files are allowed.');
      return;
    }

    const oversizedFile = files.find((file) => file.size > 5 * 1024 * 1024);

    if (oversizedFile) {
      setError('Each image must be 5MB or smaller.');
      return;
    }

    startTransition(async () => {
      try {
        await uploadAction(formData);
        setSelectedFiles([]);
        formRef.current?.reset();
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (err: any) {
        setError(err?.message ?? 'Upload failed.');
      }
    });
  }

  return (
    <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <div>
        <h2 className="text-2xl font-semibold text-slate-950">Screenshots</h2>
        <p className="mt-2 text-sm text-slate-600">
          Upload screenshots for this game. Supported formats: PNG, JPG, JPEG, WEBP.
        </p>
      </div>

      <form
        ref={formRef}
        action={handleSubmit}
        className="mt-6 rounded-2xl border border-slate-200 p-4"
      >
        <input type="hidden" name="game_id" value={gameId} />

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Select screenshots
          </label>
          <input
            ref={fileInputRef}
            type="file"
            name="screenshots"
            multiple
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFilesChange}
            className="block w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700"
          />
        </div>

        {selectedFiles.length > 0 ? (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-700">Ready to upload:</p>
            <ul className="mt-2 space-y-1 text-sm text-slate-600">
              {selectedFiles.map((file) => (
                <li key={`${file.name}-${file.size}`}>
                  {file.name} ({Math.round(file.size / 1024)} KB)
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {error ? (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="mt-4 h-12 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? 'Uploading...' : 'Upload screenshots'}
        </button>
      </form>

      <div className="mt-8">
        <h3 className="text-lg font-semibold text-slate-950">Existing screenshots</h3>

        {existingImages.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-slate-200 px-4 py-6 text-sm text-slate-500">
            No screenshots uploaded yet.
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {existingImages.map((image) => (
              <div
                key={image.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
              >
                <img
                  src={image.image_url}
                  alt="Game screenshot"
                  className="h-48 w-full object-cover"
                />
                <div className="px-4 py-3 text-xs text-slate-500">
                  Sort order: {image.sort_order}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}