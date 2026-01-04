"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/integrations/supabase/client';
import { Loading03Icon } from 'hugeicons-react';

export default function AuthCallback() {
    const router = useRouter();

    useEffect(() => {
        // The Supabase client is configured to handle the hash fragment automatically
        // when it initializes. We just need to wait for the session to be established.

        const handleAuthCallback = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error) {
                console.error('Auth callback error:', error);
                router.push('/auth?error=callback_failed');
                return;
            }

            if (session) {
                // Session established, redirect to dashboard
                console.log('Session established, redirecting to dashboard...');
                router.push('/dashboard');
            } else {
                // If no session found immediately, listen for the auth state change
                // which happens when Supabase processes the hash
                const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
                    if (event === 'SIGNED_IN' && session) {
                        router.push('/dashboard');
                    }
                });
                return () => subscription.unsubscribe();
            }
        };

        handleAuthCallback();
    }, [router]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
            <Loading03Icon className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="text-slate-600 font-medium">Verifying login...</p>
        </div>
    );
}
