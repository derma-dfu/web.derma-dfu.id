"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loading03Icon, CheckmarkCircle02Icon } from 'hugeicons-react';

const ResetPassword = () => {
    const { t } = useLanguage();
    const router = useRouter();
    const { toast } = useToast();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password.length < 6) {
            toast({
                title: t({ id: 'Error', en: 'Error' }),
                description: t({ id: 'Password minimal 6 karakter', en: 'Password must be at least 6 characters' }),
                variant: 'destructive',
            });
            return;
        }

        if (password !== confirmPassword) {
            toast({
                title: t({ id: 'Error', en: 'Error' }),
                description: t({ id: 'Password tidak cocok', en: 'Passwords do not match' }),
                variant: 'destructive',
            });
            return;
        }

        setIsLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) {
                toast({
                    title: t({ id: 'Error', en: 'Error' }),
                    description: error.message,
                    variant: 'destructive',
                });
            } else {
                setSuccess(true);
                toast({
                    title: t({ id: 'Berhasil!', en: 'Success!' }),
                    description: t({ id: 'Password berhasil diubah', en: 'Password successfully changed' }),
                });

                // Redirect to login after 2 seconds
                setTimeout(() => {
                    router.push('/auth');
                }, 2000);
            }
        } catch (error: any) {
            toast({
                title: t({ id: 'Error', en: 'Error' }),
                description: error.message || 'Failed to update password',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <img
                        src="/logo/LOGO%20DERMA-DFU.ID%20PANJANG.png"
                        alt="DERMA-DFU.ID"
                        className="h-12 w-auto object-contain mb-4"
                    />
                    <CardTitle className="text-2xl">
                        {t({ id: 'Buat Password Baru', en: 'Create New Password' })}
                    </CardTitle>
                    <CardDescription>
                        {t({
                            id: 'Masukkan password baru untuk akun Anda',
                            en: 'Enter a new password for your account'
                        })}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {success ? (
                        <div className="text-center py-8">
                            <CheckmarkCircle02Icon className="h-16 w-16 text-green-500 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">
                                {t({ id: 'Password Berhasil Diubah!', en: 'Password Successfully Changed!' })}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {t({ id: 'Anda akan diarahkan ke halaman login...', en: 'Redirecting to login page...' })}
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">
                                    {t({ id: 'Password Baru', en: 'New Password' })}
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="h-12"
                                />
                                <p className="text-xs text-muted-foreground">
                                    {t({ id: 'Minimal 6 karakter', en: 'Minimum 6 characters' })}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirm-password">
                                    {t({ id: 'Konfirmasi Password', en: 'Confirm Password' })}
                                </Label>
                                <Input
                                    id="confirm-password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                                {t({ id: 'Ubah Password', en: 'Update Password' })}
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default ResetPassword;
