"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useLanguage } from "@/components/LanguageProvider";
import { createClient } from "@/utils/supabase/browser";

function mapAuthError(message: string, t: ReturnType<typeof useLanguage>["t"]) {
  const lower = message.toLowerCase();
  if (lower.includes("invalid login credentials")) {
    return t.auth.invalidCredentials;
  }
  if (lower.includes("email not confirmed")) {
    return t.auth.emailNotConfirmed;
  }
  if (lower.includes("user already registered")) {
    return t.auth.emailInUse;
  }
  if (lower.includes("password")) {
    return t.auth.passwordTooShort;
  }
  return message;
}

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { refreshUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        throw new Error(mapAuthError(signInError.message, t));
      }

      await fetch("/api/auth/sync-user", { method: "POST" });
      await refreshUser();
      router.push("/account");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.auth.loginFailed);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-brand-gray-50 py-12 sm:py-16">
      <div className="container-app mx-auto max-w-md">
        <div className="border border-brand-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-black uppercase tracking-tight text-brand-navy">
            {t.auth.loginTitle}
          </h1>
          <p className="mt-2 text-sm text-brand-gray-600">{t.auth.loginDesc}</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="login-email"
                className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-brand-gray-500"
              >
                {t.auth.email}
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="input-field"
              />
            </div>
            <div>
              <label
                htmlFor="login-password"
                className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-brand-gray-500"
              >
                {t.auth.password}
              </label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="current-password"
                className="input-field"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary disabled:opacity-50"
            >
              {loading ? t.auth.loggingIn : t.nav.signIn}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-brand-gray-600">
            {t.auth.noAccount}{" "}
            <Link
              href="/signup"
              className="font-semibold text-brand-electric hover:underline"
            >
              {t.nav.signUp}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
