import { getPortalUser } from "@/lib/portal-auth";
import { redirect } from "next/navigation";
import { LogOut, Shield, User, Eye } from "lucide-react";

export default async function DashboardPage() {
  const user = await getPortalUser();

  if (!user) {
    redirect("/auth/error?reason=no_session");
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Tablero Test
          </h1>
          <div className="flex items-center gap-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {user.name}
            </p>
            <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
              {user.role}
            </span>
            <a
              href={process.env.NEXT_PUBLIC_PORTAL_URL ?? "/"}
              className="flex items-center gap-1.5 rounded-md border border-zinc-200 px-3 py-1.5 text-xs text-zinc-500 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              <LogOut className="h-3.5 w-3.5" />
              Portal
            </a>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-6 py-8">
        {/* SSO Info Card */}
        <div className="mb-8 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800/50 dark:bg-green-900/10">
          <p className="text-sm font-medium text-green-800 dark:text-green-400">
            SSO funcionando correctamente
          </p>
          <p className="mt-1 text-xs text-green-600 dark:text-green-500">
            Autenticado via Portal Linktic sin login adicional.
          </p>
        </div>

        {/* User Info */}
        <div className="mb-8 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Datos recibidos del Portal
          </h2>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-xs text-zinc-400 dark:text-zinc-500">ID</dt>
              <dd className="mt-1 font-mono text-sm text-zinc-900 dark:text-zinc-100">
                {user.id.slice(0, 8)}...
              </dd>
            </div>
            <div>
              <dt className="text-xs text-zinc-400 dark:text-zinc-500">Email</dt>
              <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">
                {user.email}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-zinc-400 dark:text-zinc-500">Nombre</dt>
              <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">
                {user.name}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-zinc-400 dark:text-zinc-500">Rol</dt>
              <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">
                {user.role}
              </dd>
            </div>
          </dl>
        </div>

        {/* Role-based sections */}
        <h2 className="mb-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Secciones por rol
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Everyone sees this */}
          <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-2 flex items-center gap-2">
              <Eye className="h-4 w-4 text-zinc-400" />
              <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Vista general
              </h3>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Visible para todos los roles.
            </p>
          </div>

          {/* Editor + Admin */}
          {(user.role === "editor" || user.role === "admin") && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800/50 dark:bg-blue-900/10">
              <div className="mb-2 flex items-center gap-2">
                <User className="h-4 w-4 text-blue-500" />
                <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300">
                  Edición
                </h3>
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                Visible para editor y admin.
              </p>
            </div>
          )}

          {/* Admin only */}
          {user.role === "admin" && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/50 dark:bg-amber-900/10">
              <div className="mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4 text-amber-500" />
                <h3 className="text-sm font-medium text-amber-900 dark:text-amber-300">
                  Administración
                </h3>
              </div>
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Visible solo para admin.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
