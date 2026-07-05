import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="text-center space-y-1">
        <h1 className="font-heading text-xl font-semibold text-neutral-midnight">
          Buat Password Baru
        </h1>
        <p className="font-body text-sm text-neutral-midnight/60">
          Masukkan password baru untuk akun kamu.
        </p>
      </div>
      {/* useSearchParams butuh Suspense boundary di App Router */}
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
