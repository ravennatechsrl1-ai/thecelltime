"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import OrderTracker from "@/components/OrderTracker";
import { useAuth } from "@/components/AuthProvider";
import { useLanguage } from "@/components/LanguageProvider";

export default function AccountPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { user, loading, signOut } = useAuth();

  async function handleSignOut() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  if (loading) {
    return (
      <div className="container-app py-20 text-center text-sm text-brand-gray-500">
        {t.common.loading}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container-app py-16">
        <div className="mx-auto max-w-md border border-brand-gray-200 bg-white p-8 text-center">
          <h1 className="text-xl font-black uppercase tracking-tight text-brand-navy">
            {t.auth.accountTitle}
          </h1>
          <p className="mt-3 text-sm text-brand-gray-600">{t.auth.loginRequired}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/login" className="btn-primary sm:max-w-[160px]">
              {t.nav.signIn}
            </Link>
            <Link href="/signup" className="btn-secondary sm:max-w-[160px]">
              {t.nav.signUp}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const displayName =
    (typeof user.user_metadata?.full_name === "string" &&
      user.user_metadata.full_name) ||
    user.email?.split("@")[0] ||
    t.nav.account;

  const displayAddress =
    typeof user.user_metadata?.address === "string"
      ? user.user_metadata.address.trim()
      : "";

  const displayPhone =
    typeof user.user_metadata?.phone === "string"
      ? user.user_metadata.phone.trim()
      : "";

  return (
    <div className="bg-brand-gray-50 py-10 sm:py-14">
      <div className="container-app mx-auto max-w-2xl">
        <div className="border border-brand-gray-200 bg-white p-6 sm:p-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-gray-400">
            {t.auth.accountBadge}
          </p>
          <h1 className="mt-2 text-2xl font-black uppercase tracking-tight text-brand-navy">
            {t.auth.accountTitle}
          </h1>
          <p className="mt-2 text-sm text-brand-gray-600">{t.auth.accountDesc}</p>

          <div className="mt-8 space-y-4 border border-brand-gray-100 bg-brand-gray-50 p-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-400">
                {t.auth.fullName}
              </p>
              <p className="mt-1 font-semibold text-brand-navy">{displayName}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-400">
                {t.auth.email}
              </p>
              <p className="mt-1 font-semibold text-brand-navy">{user.email}</p>
            </div>
            {displayPhone ? (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-400">
                  {t.auth.phone}
                </p>
                <p className="mt-1 font-semibold text-brand-navy">{displayPhone}</p>
              </div>
            ) : null}
            {displayAddress ? (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-400">
                  {t.auth.address}
                </p>
                <p className="mt-1 whitespace-pre-line font-semibold text-brand-navy">
                  {displayAddress}
                </p>
              </div>
            ) : null}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/shop" className="btn-secondary sm:max-w-[200px]">
              {t.nav.shop}
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="btn-primary border-red-700 bg-red-700 hover:bg-red-800 sm:max-w-[200px]"
            >
              {t.auth.logout}
            </button>
          </div>
        </div>

        <div className="mt-8">
          <OrderTracker compact defaultEmail={user.email ?? ""} />
        </div>
      </div>
    </div>
  );
}
