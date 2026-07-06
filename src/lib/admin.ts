import { auth } from "@/lib/auth";

/**
 * Memastikan yang mengakses adalah Super Admin platform (role === "ADMIN").
 * Return session kalau valid, atau objek error kalau tidak — biar dipakai
 * seragam di semua API route admin.
 */
export async function requireAdmin() {
  const session = await auth();

  if (!session?.user) {
    return {
      ok: false as const,
      status: 401,
      message: "Silakan login",
      code: "UNAUTHORIZED",
    };
  }

  if (session.user.role !== "ADMIN") {
    return {
      ok: false as const,
      status: 403,
      message: "Akses ditolak — khusus Super Admin",
      code: "FORBIDDEN",
    };
  }

  return { ok: true as const, session };
}
