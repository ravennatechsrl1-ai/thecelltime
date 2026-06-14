"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useLanguage } from "@/components/LanguageProvider";
import { createClient } from "@/utils/supabase/browser";

function mapAuthError(message: string, t: ReturnType<typeof useLanguage>["t"]) {
  const lower = message.toLowerCase();
  if (lower.includes("user already registered")) {
    return t.auth.emailInUse;
  }
  if (lower.includes("password")) {
    return t.auth.passwordTooShort;
  }
  return message;
}

export default function SignupPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { refreshUser } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setCheckEmail(false);

    try {
      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/account`,
        },
      });

      if (signUpError) {
        throw new Error(mapAuthError(signUpError.message, t));
      }

      if (data.session) {
        await fetch("/api/auth/sync-user", { method: "POST" });
        await refreshUser();
        router.push("/account");
        router.refresh();
        return;
      }

      setCheckEmail(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.auth.signupFailed);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-brand-gray-50 py-12 sm:py-16">
      <div className="container-app mx-auto max-w-md">
        <div className="border border-brand-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-black uppercase tracking-tight text-brand-navy">
            {t.auth.signupTitle}
          </h1>
          <p className="mt-2 text-sm text-brand-gray-600">{t.auth.signupDesc}</p>

          {checkEmail ? (
            <p className="mt-6 text-sm leading-relaxed text-brand-gray-600">
              {t.auth.checkEmail}
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="signup-name"
                  className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-brand-gray-500"
                >
                  {t.auth.fullName}
                </label>
                <input
                  id="signup-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  autoComplete="name"
                  className="input-field"
                />
              </div>
              <div>
                <label
                  htmlFor="signup-email"
                  className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-brand-gray-500"
                >
                  {t.auth.email}
                </label>
                <input
                  id="signup-email"
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
                  htmlFor="signup-password"
                  className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-brand-gray-500"
                >
                  {t.auth.password}
                </label>
                <input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className="input-field"
                />
                <p className="mt-1 text-xs text-brand-gray-400">
                  {t.auth.passwordHint}
                </p>
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
                {loading ? t.auth.signingUp : t.nav.signUp}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-brand-gray-600">
            {t.auth.haveAccount}{" "}
            <Link
              href="/login"
              className="font-semibold text-brand-electric hover:underline"
            >
              {t.nav.signIn}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
