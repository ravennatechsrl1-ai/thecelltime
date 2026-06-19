"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useLanguage } from "@/components/LanguageProvider";
import PasswordInput from "@/components/PasswordInput";
import SiteLogo from "@/components/SiteLogo";
import { getAuthCallbackUrl } from "@/lib/constants";
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
  const [phone, setPhone] = useState("");
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
            phone: phone.trim(),
          },
          emailRedirectTo: getAuthCallbackUrl("/", window.location.origin),
        },
      });

      if (signUpError) {
        throw new Error(mapAuthError(signUpError.message, t));
      }

      if (data.user?.identities?.length === 0) {
        throw new Error(t.auth.emailInUse);
      }

      async function finishSignIn() {
        await fetch("/api/auth/sync-user", { method: "POST" });
        await refreshUser();
        router.push("/");
        router.refresh();
      }

      if (data.session) {
        await finishSignIn();
        return;
      }

      // Confirm email off: Supabase usually returns a session, but sign in if it did not.
      const { data: signInData, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (signInError) {
        if (signInError.message.toLowerCase().includes("email not confirmed")) {
          setCheckEmail(true);
          return;
        }
        throw new Error(mapAuthError(signInError.message, t));
      }

      if (signInData.session) {
        await finishSignIn();
        return;
      }

      setCheckEmail(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.auth.signupFailed);
    } finally {
      setLoading(false);
    }
  }

  const fieldClass =
    "min-h-[48px] w-full rounded-lg border border-brand-gray-200 bg-white px-4 py-3 text-sm text-brand-navy outline-none transition-colors placeholder:text-brand-gray-400 focus:border-brand-electric focus:ring-2 focus:ring-brand-electric/20";

  return (
    <div className="relative flex min-h-[calc(100vh-80px)] items-center justify-center overflow-hidden bg-gradient-to-br from-brand-navy via-[#132238] to-brand-navy-light px-4 py-12 sm:py-16">
      <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-brand-electric/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-violet-600/15 blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/95 shadow-2xl backdrop-blur-md">
          <div className="border-b border-brand-gray-100 bg-gradient-to-r from-brand-navy to-[#1a3055] px-6 py-8 text-center sm:px-8">
            <div className="flex justify-center">
              <SiteLogo className="h-11 w-auto" linked={false} />
            </div>
            <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.25em] text-brand-electric-light">
              {t.auth.signupBadge}
            </p>
            <h1 className="mt-2 text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">
              {t.auth.signupTitle}
            </h1>
            <p className="mt-2 text-sm text-white/60">{t.auth.signupDesc}</p>
          </div>

          <div className="p-6 sm:p-8">
            {checkEmail ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-5 text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    aria-hidden="true"
                  >
                    <path
                      d="M4 6h16v12H4z"
                      strokeLinejoin="round"
                    />
                    <path d="M4 8l8 5 8-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <p className="mt-4 text-sm leading-relaxed text-emerald-800">
                  {t.auth.checkEmail}
                </p>
                <Link
                  href="/login"
                  className="mt-5 inline-flex min-h-[44px] items-center justify-center rounded-lg bg-brand-electric px-5 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-brand-electric-dark"
                >
                  {t.nav.signIn}
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="signup-name"
                    className="mb-2 block text-xs font-bold uppercase tracking-wide text-brand-gray-500"
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
                    className={fieldClass}
                  />
                </div>

                <div>
                  <label
                    htmlFor="signup-phone"
                    className="mb-2 block text-xs font-bold uppercase tracking-wide text-brand-gray-500"
                  >
                    {t.auth.phone}
                  </label>
                  <input
                    id="signup-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    autoComplete="tel"
                    placeholder={t.auth.phonePlaceholder}
                    className={fieldClass}
                  />
                </div>

                <div>
                  <label
                    htmlFor="signup-email"
                    className="mb-2 block text-xs font-bold uppercase tracking-wide text-brand-gray-500"
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
                    className={fieldClass}
                  />
                </div>

                <div>
                  <label
                    htmlFor="signup-password"
                    className="mb-2 block text-xs font-bold uppercase tracking-wide text-brand-gray-500"
                  >
                    {t.auth.password}
                  </label>
                  <PasswordInput
                    id="signup-password"
                    value={password}
                    onChange={setPassword}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    hint={t.auth.passwordHint}
                    inputClassName={`${fieldClass} pr-12`}
                  />
                </div>

                {error && (
                  <p
                    className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
                    role="alert"
                  >
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex min-h-[48px] w-full items-center justify-center rounded-lg bg-gradient-to-r from-brand-electric to-brand-electric-dark text-sm font-bold uppercase tracking-wide text-white shadow-glow-electric transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? t.auth.signingUp : t.nav.signUp}
                </button>
              </form>
            )}

            {!checkEmail && (
              <p className="mt-6 text-center text-sm text-brand-gray-600">
                {t.auth.haveAccount}{" "}
                <Link
                  href="/login"
                  className="font-bold text-brand-electric transition-colors hover:text-brand-electric-dark"
                >
                  {t.nav.signIn}
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
