"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loading03Icon, ArrowLeft01Icon } from 'hugeicons-react';
import Link from 'next/link';

const ForgotPassword = () => {
    const { t } = useLanguage();
    const router = useRouter();
    const { toast } = useToast();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            toast({
                title: t({ id: 'Error', en: 'Error' }),
                description: t({ id: 'Masukkan alamat email Anda', en: 'Please enter your email address' }),
                variant: 'destructive',
            });
            return;
        }

        setIsLoading(true);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/reset-password`,
            });

            if (error) {
                toast({
                    title: t({ id: 'Error', en: 'Error' }),
                    description: error.message,
                    variant: 'destructive',
                });
            } else {
                setEmailSent(true);
            }
        } catch (error: any) {
            toast({
                title: t({ id: 'Error', en: 'Error' }),
                description: error.message || 'Gagal mengirim email',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-4">
                    <Link href="/auth" className="inline-flex items-center text-sm text-primary hover:underline">
                        <ArrowLeft01Icon className="h-4 w-4 mr-2" />
                        {t({ id: 'Kembali ke Login', en: 'Back to Login' })}
                    </Link>
                    <div>
                        <img
                            src="/logo/LOGO%20DERMA-DFU.ID%20PANJANG.png"
                            alt="DERMA-DFU.ID"
                            className="h-12 w-auto object-contain mb-4"
                        />
                        <CardTitle className="text-2xl">
                            {t({ id: 'Lupa Password?', en: 'Forgot Password?' })}
                        </CardTitle>
                        <CardDescription className="mt-2">
                            {emailSent ? (
                                t({
                                    id: 'Email sudah terkirim! Silakan cek inbox Anda.',
                                    en: 'Email sent! Please check your inbox.'
                                })
                            ) : (
                                t({
                                    id: 'Masukkan email Anda dan kami akan mengirimkan link untuk reset password.',
                                    en: 'Enter your email and we will send you a link to reset your password.'
                                })
                            )}
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    {emailSent ? (
                        <div className="space-y-4">
                            <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                                <p className="text-sm text-green-800">
                                    {t({
                                        id: 'Kami telah mengirim link reset password ke',
                                        en: 'We have sent a password reset link to'
                                    })}{' '}
                                    <strong>{email}</strong>
                                </p>
                                <p className="text-xs text-green-700 mt-2">
                                    {t({
                                        id: 'Link akan expired dalam 1 jam. Jika tidak menerima email, cek folder spam.',
                                        en: 'Link will expire in 1 hour. If you don\'t receive it, check your spam folder.'
                                    })}
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => {
                                    setEmailSent(false);
                                    setEmail('');
                                }}
                            >
                                {t({ id: 'Kirim Ulang', en: 'Resend' })}
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">
                                    {t({ id: 'Alamat Email', en: 'Email Address' })}
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="h-12"
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full h-12"
                                disabled={isLoading}
                            >
                                {isLoading && <Loading03Icon className="mr-2 h-4 w-4 animate-spin" />}
                                {t({ id: 'Kirim Link Reset Password', en: 'Send Reset Link' })}
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default ForgotPassword;
