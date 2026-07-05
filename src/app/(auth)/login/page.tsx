import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="text-center space-y-1">
        <h1 className="font-heading text-xl font-semibold text-neutral-midnight">
          Selamat Datang Kembali
        </h1>
        <p className="font-body text-sm text-neutral-midnight/60">
          Masuk untuk mengelola event dan kenanganmu.
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
