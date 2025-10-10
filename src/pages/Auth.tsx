import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const Auth = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ name: '', email: '', password: '', confirmPassword: '' });

  // Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/dashboard');
      }
    };
    checkUser();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) {
        toast({
          title: t({ id: 'Login Gagal', en: 'Login Failed' }),
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      if (data.session) {
        toast({
          title: t({ id: 'Login Berhasil', en: 'Login Successful' }),
          description: t({ id: 'Selamat datang kembali!', en: 'Welcome back!' }),
        });
        navigate('/dashboard');
      }
    } catch (error) {
      toast({
        title: t({ id: 'Error', en: 'Error' }),
        description: t({ id: 'Terjadi kesalahan', en: 'An error occurred' }),
        variant: 'destructive',
      });
    } finally {
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

    try {
      const { data, error } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          data: {
            full_name: signupData.name,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        toast({
          title: t({ id: 'Registrasi Gagal', en: 'Registration Failed' }),
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      if (data.session) {
        toast({
          title: t({ id: 'Registrasi Berhasil', en: 'Registration Successful' }),
          description: t({ id: 'Akun Anda telah dibuat!', en: 'Your account has been created!' }),
        });
        navigate('/dashboard');
      }
    } catch (error) {
      toast({
        title: t({ id: 'Error', en: 'Error' }),
        description: t({ id: 'Terjadi kesalahan', en: 'An error occurred' }),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md rounded-2xl shadow-lg">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-primary-foreground font-bold text-2xl">D</span>
          </div>
          <CardTitle className="text-2xl text-secondary">DERMA-DFU.ID</CardTitle>
          <CardDescription>
            {t({ id: 'Masuk atau daftar untuk melanjutkan', en: 'Login or register to continue' })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login" className="min-h-[44px]">
                {t({ id: 'Masuk', en: 'Login' })}
              </TabsTrigger>
              <TabsTrigger value="signup" className="min-h-[44px]">
                {t({ id: 'Daftar', en: 'Sign Up' })}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="email@example.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                    className="min-h-[44px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                    className="min-h-[44px]"
                  />
                </div>
                <Button type="submit" className="w-full min-h-[48px]" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t({ id: 'Memproses...', en: 'Processing...' })}
                    </>
                  ) : (
                    t({ id: 'Masuk', en: 'Login' })
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">
                    {t({ id: 'Nama Lengkap', en: 'Full Name' })}
                  </Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="John Doe"
                    value={signupData.name}
                    onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                    required
                    className="min-h-[44px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="email@example.com"
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                    required
                    className="min-h-[44px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    required
                    className="min-h-[44px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm">
                    {t({ id: 'Konfirmasi Password', en: 'Confirm Password' })}
                  </Label>
                  <Input
                    id="signup-confirm"
                    type="password"
                    value={signupData.confirmPassword}
                    onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                    required
                    className="min-h-[44px]"
                  />
                </div>
                <Button type="submit" className="w-full min-h-[48px]" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t({ id: 'Memproses...', en: 'Processing...' })}
                    </>
                  ) : (
                    t({ id: 'Daftar', en: 'Sign Up' })
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
