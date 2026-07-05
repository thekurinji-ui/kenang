import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="text-center space-y-1">
        <h1 className="font-heading text-xl font-semibold text-neutral-midnight">
          Lupa Password?
        </h1>
        <p className="font-body text-sm text-neutral-midnight/60">
          Masukkan email kamu, kami kirimkan link untuk reset password.
        </p>
      </div>
      <ForgotPasswordForm />
    </div>
  );
}
