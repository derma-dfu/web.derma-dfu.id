"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loading03Icon } from 'hugeicons-react';
import { supabase } from '@/integrations/supabase/client';
import Link from 'next/link';

const Auth = () => {
    const { t } = useLanguage();
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [signupData, setSignupData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [showVerificationSent, setShowVerificationSent] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    // Check if user is already logged in

    // Use direct effect for redirection to be safe with Supabase
    // Optimized session check
    useEffect(() => {
        let mounted = true;

        const checkSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (mounted && session && !showVerificationSent) {
                    // Check role immediately to avoid double redirect
                    const role = session.user.user_metadata?.role;
                    if (role === 'admin') {
                        router.replace('/admin');
                    } else {
                        router.replace('/dashboard');
                    }
                }
            } catch (error) {
                console.error("Session check error:", error);
            }
        };

        checkSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (mounted && session && !showVerificationSent) {
                const role = session.user.user_metadata?.role;
                if (role === 'admin') {
                    router.replace('/admin');
                } else {
                    router.replace('/dashboard');
                }
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, [router, showVerificationSent]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const { error } = await supabase.auth.signInWithPassword({
            email: loginData.email,
            password: loginData.password,
        });

        if (!error) {
            toast({
                title: t({ id: 'Login Berhasil', en: 'Login Successful' }),
                description: t({ id: 'Selamat datang kembali!', en: 'Welcome back!' }),
            });
            router.push('/dashboard');
        } else {
            toast({
                title: t({ id: 'Login Gagal', en: 'Login Failed' }),
                description: error.message,
                variant: 'destructive',
            });
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/dashboard`,
                }
            });

            if (error) {
                toast({
                    title: t({ id: 'Error', en: 'Error' }),
                    description: error.message,
                    variant: 'destructive',
                });
                setIsLoading(false);
            }
        } catch (error: any) {
            toast({
                title: t({ id: 'Error', en: 'Error' }),
                description: error.message || 'Failed to login with Google',
                variant: 'destructive',
            });
            setIsLoading(false);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();

        if (signupData.password !== signupData.confirmPassword) {
            toast({
                title: t({ id: 'Error', en: 'Error' }),
                description: t({ id: 'Password tidak cocok', en: 'Passwords do not match' }),
                variant: 'destructive',
            });
            return;
        }

        if (signupData.password.length < 6) {
            toast({
                title: t({ id: 'Error', en: 'Error' }),
                description: t({ id: 'Password minimal 6 karakter', en: 'Password must be at least 6 characters' }),
                variant: 'destructive',
            });
            return;
        }

        setIsLoading(true);

        const { error } = await supabase.auth.signUp({
            email: signupData.email,
            password: signupData.password,
            options: {
                data: {
                    full_name: signupData.name,
                },
            },
        });

        if (!error) {
            setShowVerificationSent(true);
            toast({
                title: t({ id: 'Pendaftaran Berhasil!', en: 'Registration Successful!' }),
                description: t({
                    id: 'Silakan cek email Anda untuk verifikasi.',
                    en: 'Please check your email for verification.'
                }),
            });
            setIsLoading(false);
        } else {
            toast({
                title: t({ id: 'Registrasi Gagal', en: 'Registration Failed' }),
                description: error.message,
                variant: 'destructive',
            });
            setIsLoading(false);
        }
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Left Side - Visuals */}
            <div className="hidden lg:flex flex-col justify-center items-center bg-primary/5 relative overflow-hidden p-12">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 z-0" />
                <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid-pattern.svg')] opacity-30 z-0" />

                <div className="relative z-10 max-w-lg text-center">
                    {/* Logo */}
                    <img
                        src="/logo/logo-derma-dfu-panjang.png"
                        alt="DERMA-DFU.ID"
                        className="h-24 w-auto object-contain mx-auto mb-8"
                    />
                    <h1 className="text-4xl font-bold text-secondary mb-6 leading-tight">
                        {t({
                            id: 'Solusi Kesehatan Modern untuk Anda',
                            en: 'Modern Health Solutions for You'
                        })}
                    </h1>
                    <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                        {t({
                            id: 'Bergabunglah dengan ribuan pengguna lain untuk mendapatkan akses ke layanan kesehatan digital terbaik.',
                            en: 'Join thousands of other users to access the best digital healthcare services.'
                        })}
                    </p>

                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="bg-white/40 backdrop-blur-sm p-4 rounded-2xl border border-white/30">
                            <p className="text-2xl font-bold text-primary mb-1">10k+</p>
                            <p className="text-xs text-muted-foreground">Users</p>
                        </div>
                        <div className="bg-white/40 backdrop-blur-sm p-4 rounded-2xl border border-white/30">
                            <p className="text-2xl font-bold text-primary mb-1">50+</p>
                            <p className="text-xs text-muted-foreground">Experts</p>
                        </div>
                        <div className="bg-white/40 backdrop-blur-sm p-4 rounded-2xl border border-white/30">
                            <p className="text-2xl font-bold text-primary mb-1">24/7</p>
                            <p className="text-xs text-muted-foreground">Support</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex items-center justify-center p-8 bg-background">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                            {showVerificationSent
                                ? t({ id: 'Cek Email Anda', en: 'Check Your Email' })
                                : t({ id: 'Selamat Datang', en: 'Welcome Back' })}
                        </h2>
                        <p className="text-muted-foreground mt-2">
                            {showVerificationSent
                                ? t({
                                    id: `Kami telah mengirimkan link verifikasi ke ${signupData.email}. Silakan cek inbox atau spam Anda.`,
                                    en: `We sent a verification link to ${signupData.email}. Please check your inbox or spam.`
                                })
                                : t({ id: 'Silakan masuk ke akun Anda', en: 'Please enter your details to sign in' })}
                        </p>
                    </div>

                    {showVerificationSent ? (
                        <div className="space-y-6 text-center">
                            <div className="flex justify-center my-8">
                                <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
                                    <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                className="w-full h-12 rounded-xl"
                                onClick={() => setShowVerificationSent(false)}
                            >
                                {t({ id: 'Kembali ke Login', en: 'Back to Login' })}
                            </Button>
                        </div>
                    ) : (
                        <Tabs defaultValue="login" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted/50 p-1 rounded-full">
                                <TabsTrigger value="login" className="rounded-full py-2.5 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                    {t({ id: 'Masuk', en: 'Login' })}
                                </TabsTrigger>
                                <TabsTrigger value="signup" className="rounded-full py-2.5 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                    {t({ id: 'Daftar', en: 'Sign Up' })}
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="login" className="space-y-6">
                                <form onSubmit={handleLogin} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="login-email" className="text-sm font-medium text-gray-700 ml-1">Email</Label>
                                        <Input
                                            id="login-email"
                                            type="email"
                                            placeholder="name@example.com"
                                            value={loginData.email}
                                            onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                                            required
                                            className="h-12 px-4 rounded-xl border-gray-200 focus:border-primary focus:ring-primary/20 transition-all bg-gray-50/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between ml-1">
                                            <Label htmlFor="login-password" >Password</Label>
                                            <Link
                                                href="/auth/forgot-password"
                                                className="text-xs font-medium text-primary hover:underline"
                                            >
                                                {t({ id: 'Lupa password?', en: 'Forgot password?' })}
                                            </Link>
                                        </div>
                                        <Input
                                            id="login-password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={loginData.password}
                                            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                                            required
                                            className="h-12 px-4 rounded-xl border-gray-200 focus:border-primary focus:ring-primary/20 transition-all bg-gray-50/50"
                                        />
                                    </div>
                                    <Button type="submit" className="w-full h-12 rounded-xl text-base font-medium shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all" disabled={isLoading}>
                                        {isLoading ? (
                                            <>
                                                <Loading03Icon className="mr-2 h-5 w-5 animate-spin" />
                                                {t({ id: 'Memproses...', en: 'Processing...' })}
                                            </>
                                        ) : (
                                            t({ id: 'Masuk', en: 'Sign In' })
                                        )}
                                    </Button>

                                    {/* Divider */}
                                    <div className="relative my-4">
                                        <div className="absolute inset-0 flex items-center">
                                            <span className="w-full border-t border-gray-200" />
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className="bg-white px-2 text-muted-foreground">
                                                {t({ id: 'Atau', en: 'Or' })}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Google Login */}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full h-12 rounded-xl text-base font-medium"
                                        onClick={handleGoogleLogin}
                                        disabled={isLoading}
                                    >
                                        <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                                            <path
                                                fill="#4285F4"
                                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            />
                                            <path
                                                fill="#34A853"
                                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            />
                                            <path
                                                fill="#FBBC05"
                                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                            />
                                            <path
                                                fill="#EA4335"
                                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            />
                                        </svg>
                                        {t({ id: 'Masuk dengan Google', en: 'Sign in with Google' })}
                                    </Button>
                                </form>
                            </TabsContent>

                            <TabsContent value="signup" className="space-y-6">
                                <form onSubmit={handleSignup} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="signup-name" className="ml-1">
                                            {t({ id: 'Nama Lengkap', en: 'Full Name' })}
                                        </Label>
                                        <Input
                                            id="signup-name"
                                            type="text"
                                            placeholder="John Doe"
                                            value={signupData.name}
                                            onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                                            required
                                            className="h-12 px-4 rounded-xl border-gray-200 focus:border-primary focus:ring-primary/20 transition-all bg-gray-50/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="signup-email" className="ml-1">Email</Label>
                                        <Input
                                            id="signup-email"
                                            type="email"
                                            placeholder="name@example.com"
                                            value={signupData.email}
                                            onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                                            required
                                            className="h-12 px-4 rounded-xl border-gray-200 focus:border-primary focus:ring-primary/20 transition-all bg-gray-50/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="signup-password" className="ml-1">Password</Label>
                                        <Input
                                            id="signup-password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={signupData.password}
                                            onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                                            required
                                            className="h-12 px-4 rounded-xl border-gray-200 focus:border-primary focus:ring-primary/20 transition-all bg-gray-50/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="signup-confirm" className="ml-1">
                                            {t({ id: 'Konfirmasi Password', en: 'Confirm Password' })}
                                        </Label>
                                        <Input
                                            id="signup-confirm"
                                            type="password"
                                            placeholder="••••••••"
                                            value={signupData.confirmPassword}
                                            onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                                            required
                                            className="h-12 px-4 rounded-xl border-gray-200 focus:border-primary focus:ring-primary/20 transition-all bg-gray-50/50"
                                        />
                                    </div>
                                    <Button type="submit" className="w-full h-12 rounded-xl text-base font-medium shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all" disabled={isLoading}>
                                        {isLoading ? (
                                            <>
                                                <Loading03Icon className="mr-2 h-5 w-5 animate-spin" />
                                                {t({ id: 'Memproses...', en: 'Processing...' })}
                                            </>
                                        ) : (
                                            t({ id: 'Buat Akun', en: 'Create Account' })
                                        )}
                                    </Button>

                                    {/* Divider */}
                                    <div className="relative my-4">
                                        <div className="absolute inset-0 flex items-center">
                                            <span className="w-full border-t border-gray-200" />
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className="bg-white px-2 text-muted-foreground">
                                                {t({ id: 'Atau', en: 'Or' })}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Google Signup */}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full h-12 rounded-xl text-base font-medium"
                                        onClick={handleGoogleLogin}
                                        disabled={isLoading}
                                    >
                                        <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                                            <path
                                                fill="#4285F4"
                                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            />
                                            <path
                                                fill="#34A853"
                                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            />
                                            <path
                                                fill="#FBBC05"
                                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                            />
                                            <path
                                                fill="#EA4335"
                                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            />
                                        </svg>
                                        {t({ id: 'Daftar dengan Google', en: 'Sign up with Google' })}
                                    </Button>
                                </form>
                            </TabsContent>
                        </Tabs>
                    )}

                    <div className="text-center text-sm text-muted-foreground">
                        <p>{t({
                            id: 'Dengan melanjutkan, Anda menyetujui Syarat & Ketentuan kami.',
                            en: 'By continuing, you agree to our Terms & Conditions.'
                        })}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auth;
