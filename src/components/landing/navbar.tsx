import { auth } from "@/lib/auth";
import { LandingNavbarClient } from "@/components/landing/navbar-client";

// Server wrapper: cek status login di server (tidak perlu client fetch),
// perilaku scroll (blur + shrink) dan mobile menu ada di navbar-client.tsx.
export async function LandingNavbar() {
  const session = await auth();
  return <LandingNavbarClient isLoggedIn={Boolean(session?.user)} />;
}
