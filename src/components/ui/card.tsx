import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-lg border border-neutral-slate bg-neutral-white shadow-soft",
        className
      )}
      {...props}
    />
  );
}
