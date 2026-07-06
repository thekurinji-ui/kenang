import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Ambil role user langsung dari database berdasarkan userId dari session.
 * Sengaja tidak mengandalkan session.user.role — session/JWT tidak
 * membawa field role, jadi role selalu dicek fresh dari database.
 */
export async function getUserRole(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return user?.role ?? null;
}

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

  const role = await getUserRole(session.user.id);

  if (role !== "ADMIN") {
    return {
      ok: false as const,
      status: 403,
      message: "Akses ditolak — khusus Super Admin",
      code: "FORBIDDEN",
    };
  }

  return { ok: true as const, session };
}
