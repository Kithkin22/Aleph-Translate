"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { getPage, pagePath } from "@/lib/library/storage";

/** Legacy URL — redirect to library page path. */
export default function LegacyWorkspaceRedirect() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  useEffect(() => {
    const page = getPage(params.id);
    if (page) {
      router.replace(pagePath(page));
    } else {
      router.replace("/library");
    }
  }, [params.id, router]);

  return (
    <div className="flex min-h-dvh items-center justify-center text-stone-500">
      Redirecting…
    </div>
  );
}
