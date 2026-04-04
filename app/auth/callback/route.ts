import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (!code) {
    console.error("No code provided in callback");
    return NextResponse.redirect(`${origin}/signin?error=no_code`);
  }

  try {
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet: Array<{
            name: string;
            value: string;
            options?: CookieOptions;
          }>) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch (error) {
              // Called from Server Component - ignore
              console.error("Cookie set error:", error);
            }
          },
        },
      },
    );

    const { error, data } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Supabase exchange error:", error.message);
      return NextResponse.redirect(`${origin}/signin?error=exchange_failed`);
    }
    
    // Redirigir al dashboard - usuario queda logueado automáticamente
    return NextResponse.redirect(`${origin}${next}`);
  } catch (error) {
    console.error("Callback error:", error);
    return NextResponse.redirect(`${origin}/signin?error=callback_failed`);
  }
}
