"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

const REASONS: Record<string, string> = {
  invalid_state: "Error de seguridad en la autenticación.",
  verify_failed: "No se pudo verificar tu acceso. Contacta al administrador.",
  no_session: "No tienes sesión activa en el portal.",
  no_access: "No tienes permiso para acceder a esta aplicación.",
};

// Errors that can be resolved by retrying (portal session might exist now)
const RETRYABLE = new Set(["invalid_state", "no_session"]);

function ErrorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reason = searchParams.get("reason") ?? "unknown";
  const canRetry = RETRYABLE.has(reason);
  const [countdown, setCountdown] = useState(canRetry ? 5 : 0);

  // Auto-retry: redirect to / which triggers silent check
  useEffect(() => {
    if (!canRetry) return;
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          router.replace("/");
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [canRetry, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="w-full max-w-sm space-y-4 rounded-xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Acceso denegado
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {REASONS[reason] ?? "Error desconocido."}
        </p>

        <div className="flex flex-col gap-2">
          {canRetry && (
            <>
              <button
                onClick={() => router.replace("/")}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                <RefreshCw className="h-4 w-4" />
                Reintentar
              </button>
              {countdown > 0 && (
                <p className="text-xs text-zinc-400 dark:text-zinc-500">
                  Reintentando en {countdown}s...
                </p>
              )}
            </>
          )}
          <a
            href={process.env.NEXT_PUBLIC_PORTAL_URL ?? "/"}
            className="inline-block rounded-md border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Ir al Portal
          </a>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense>
      <ErrorContent />
    </Suspense>
  );
}
