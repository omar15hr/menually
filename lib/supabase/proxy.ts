import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

// Rutas protegidas que requieren autenticación
const protectedRoutes = [
  "/dashboard",
  "/plan",
  "/business",
  "/auth/update-password",
];

// Rutas de autenticación (usuarios autenticados no pueden acceder)
const authRoutes = ["/auth/signin", "/auth/signup", "/auth/reset-password"];

// Rutas exentas de verificación de suscripción
const subscriptionExemptRoutes = [
  "/onboarding",
  "/api/webhooks",
  "/auth",
  "/menu",
];

type SubscriptionRow = Database["public"]["Tables"]["subscriptions"]["Row"];

export function isSubscriptionExempt(pathname: string): boolean {
  return subscriptionExemptRoutes.some((route) => pathname.startsWith(route));
}

export function resolveSubscriptionAccess(
  subscription: SubscriptionRow | null,
): { isAllowed: boolean; redirectTo?: string } {
  if (!subscription) {
    return { isAllowed: true };
  }

  if (subscription.status === "active") {
    return { isAllowed: true };
  }

  if (subscription.status === "trial") {
    if (!subscription.trial_ends_at) {
      return { isAllowed: false, redirectTo: "/onboarding" };
    }
    const isExpired = new Date(subscription.trial_ends_at) <= new Date();
    if (isExpired) {
      return { isAllowed: false, redirectTo: "/onboarding" };
    }
    return { isAllowed: true };
  }

  if (subscription.status === "cancelled" || subscription.status === "past_due") {
    return { isAllowed: false, redirectTo: "/settings/subscription" };
  }

  return { isAllowed: false, redirectTo: "/onboarding" };
}

export async function checkSubscriptionStatus(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<{
  isAllowed: boolean;
  redirectTo?: string;
  subscription?: SubscriptionRow | null;
}> {
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (!subscription) {
    return { isAllowed: false, redirectTo: "/onboarding", subscription: null };
  }

  const access = resolveSubscriptionAccess(subscription);
  return { ...access, subscription };
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANTE: No ejecutar código entre createServerClient y supabase.auth.getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Verificar si la ruta actual es una ruta protegida
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // Verificar si la ruta actual es una ruta de autenticación
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Si el usuario NO está autenticado y trata de acceder a una ruta protegida
  // Redirigir a la página de signin
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/signin";
    return NextResponse.redirect(url);
  }

  // Si el usuario YA está autenticado y trata de acceder a una ruta de autenticación
  // Redirigir al dashboard
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Verificación de suscripción para usuarios autenticados
  if (user && !isSubscriptionExempt(pathname)) {
    const { isAllowed, redirectTo } = await checkSubscriptionStatus(
      supabase,
      user.id,
    );

    if (!isAllowed && redirectTo) {
      const url = request.nextUrl.clone();
      url.pathname = redirectTo;
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
