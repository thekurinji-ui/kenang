"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { loginSchema } from "@/lib/validation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { z } from "zod";

type LoginForm = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginForm) => {
    setServerError(null);
    const result = await signIn("credentials", { ...values, redirect: false });

    if (result?.error) {
      setServerError("Email atau password salah");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full max-w-sm">
      <Input
        label="Email"
        type="email"
        placeholder="kamu@email.com"
        {...register("email")}
        error={errors.email?.message}
      />
      <Input
        label="Password"
        type="password"
        placeholder="Password"
        {...register("password")}
        error={errors.password?.message}
      />
      <Link
        href="/forgot-password"
        className="-mt-2 self-end text-xs text-crimson font-medium font-body"
      >
        Lupa password?
      </Link>
      {serverError && <p className="text-sm text-crimson">{serverError}</p>}
      <Button type="submit" isLoading={isSubmitting} className="mt-2 w-full">
        Masuk
      </Button>

      <div className="flex items-center gap-3 my-1">
        <span className="h-px flex-1 bg-neutral-slate" />
        <span className="text-xs text-neutral-midnight/50 font-body">atau</span>
        <span className="h-px flex-1 bg-neutral-slate" />
      </div>

      <Button
        type="button"
        variant="secondary"
        className="w-full"
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
          <path
            fill="#4285F4"
            d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.63h6.47c-.28 1.5-1.13 2.77-2.4 3.62v3.01h3.89c2.27-2.09 3.56-5.17 3.56-8.81Z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.96-1.07 7.95-2.92l-3.89-3.01c-1.08.72-2.46 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.94H1.28v3.1C3.26 21.3 7.31 24 12 24Z"
          />
          <path
            fill="#FBBC05"
            d="M5.29 14.28A7.2 7.2 0 0 1 4.9 12c0-.79.14-1.56.39-2.28V6.62H1.28A11.99 11.99 0 0 0 0 12c0 1.94.46 3.77 1.28 5.38l4.01-3.1Z"
          />
          <path
            fill="#EA4335"
            d="M12 4.77c1.76 0 3.35.61 4.59 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.28 6.62l4.01 3.1C6.23 6.88 8.88 4.77 12 4.77Z"
          />
        </svg>
        Masuk dengan Google
      </Button>

      <p className="text-center text-sm text-neutral-midnight/60 font-body">
        Belum punya akun?{" "}
        <Link href="/register" className="text-crimson font-medium">
          Daftar
        </Link>
      </p>
    </form>
  );
}
