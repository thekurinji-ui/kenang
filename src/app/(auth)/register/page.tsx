import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="text-center space-y-1">
        <h1 className="font-heading text-xl font-semibold text-neutral-midnight">
          Buat Akun Host
        </h1>
        <p className="font-body text-sm text-neutral-midnight/60">
          Mulai kumpulkan kenangan dari acaramu.
        </p>
      </div>
      <RegisterForm />
    </div>
  );
}
