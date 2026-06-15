"use client";

import { useRouter } from "next/navigation";

interface AppShellBackButtonProps {
  backHref?: string;
}

function canNavigateBack(): boolean {
  if (typeof window === "undefined") return false;
  if (window.history.length > 1) return true;
  try {
    const referrer = document.referrer;
    return Boolean(referrer && new URL(referrer).origin === window.location.origin);
  } catch {
    return false;
  }
}

export function AppShellBackButton({ backHref = "/" }: AppShellBackButtonProps) {
  const router = useRouter();

  function handleBack() {
    if (canNavigateBack()) {
      router.back();
      return;
    }
    router.push(backHref);
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl text-stone-600 transition-colors hover:bg-stone-200/70 active:bg-stone-200 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100"
      aria-label="Go back"
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </button>
  );
}
