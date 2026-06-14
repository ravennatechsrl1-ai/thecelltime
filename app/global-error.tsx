"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="it">
      <body className="flex min-h-screen items-center justify-center bg-white p-6 font-sans">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">
            Something went wrong
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-600">
            The application encountered an unexpected error. Please try again.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-8 min-h-[44px] rounded-full bg-blue-600 px-6 py-2.5 text-sm font-bold text-white"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
