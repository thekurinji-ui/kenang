import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/components/dashboard/profile-form";

export default async function ProfilePage() {
  const session = await auth();
  const user = await prisma.user.findUnique({
    where: { id: session!.user.id },
    select: { name: true, email: true },
  });

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-neutral-midnight">Profile</h1>
        <p className="font-body text-sm text-neutral-midnight/60 mt-1">
          Kelola informasi akun dan keamanan login kamu.
        </p>
      </div>
      <ProfileForm initialName={user!.name} email={user!.email} />
    </div>
  );
}
