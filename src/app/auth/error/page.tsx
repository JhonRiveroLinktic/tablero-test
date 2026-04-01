"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const REASONS: Record<string, string> = {
  invalid_state: "Error de seguridad en la autenticación. Intenta de nuevo.",
  verify_failed: "No se pudo verificar tu acceso. Contacta al administrador.",
  no_session: "No tienes sesión activa en el portal.",
  no_access: "No tienes permiso para acceder a esta aplicación.",
};

function ErrorContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason") ?? "unknown";

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="w-full max-w-sm space-y-4 rounded-xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Acceso denegado
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {REASONS[reason] ?? "Error desconocido."}
        </p>
        <a
          href={process.env.NEXT_PUBLIC_PORTAL_URL ?? "/"}
          className="inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          Ir al Portal
        </a>
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
