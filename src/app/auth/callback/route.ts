
import { NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/dashboard';

    if (code) {
        try {
            const cookieStore = await cookies();
            const supabase = createServerClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                {
                    cookies: {
                        getAll() {
                            return cookieStore.getAll();
                        },
                        setAll(cookiesToSet) {
                            try {
                                cookiesToSet.forEach(({ name, value, options }) =>
                                    cookieStore.set(name, value, options)
                                );
                            } catch {
                                // The `setAll` method was called from a Server Component.
                                // This can be ignored if you have middleware refreshing
                                // user sessions.
                            }
                        },
                    },
                }
            );

            const { error } = await supabase.auth.exchangeCodeForSession(code);

            if (!error) {
                // Successful login
                // Use getUser() for better security as per Supabase recommendation
                const { data: { user } } = await supabase.auth.getUser();
                const role = user?.user_metadata?.role;

                if (role === 'admin') {
                    return NextResponse.redirect(`${origin}/admin`);
                }
                return NextResponse.redirect(`${origin}${next}`);
            } else {
                console.error('Exchange Code Error:', error);
            }
        } catch (err) {
            console.error('Callback Route Error:', err);
            // Return simple redirect on crash to avoid 502
            return NextResponse.redirect(`${origin}/auth?error=server_error`);
        }
    }

    return NextResponse.redirect(`${origin}/auth?error=auth_code_missing`);
}
