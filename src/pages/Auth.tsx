import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ name: '', email: '', password: '', confirmPassword: '' });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login - in production this would call Lovable Cloud auth
    toast({
      title: t({ id: 'Login Berhasil', en: 'Login Successful' }),
      description: t({ id: 'Selamat datang kembali!', en: 'Welcome back!' }),
    });
    navigate('/dashboard');
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (signupData.password !== signupData.confirmPassword) {
      toast({
        title: t({ id: 'Error', en: 'Error' }),
        description: t({ id: 'Password tidak cocok', en: 'Passwords do not match' }),
        variant: 'destructive',
      });
      return;
    }
    // Mock signup - in production this would call Lovable Cloud auth
    toast({
      title: t({ id: 'Registrasi Berhasil', en: 'Registration Successful' }),
      description: t({ id: 'Akun Anda telah dibuat', en: 'Your account has been created' }),
    });
    navigate('/dashboard');
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
                <Button type="submit" className="w-full min-h-[48px]">
                  {t({ id: 'Masuk', en: 'Login' })}
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
                <Button type="submit" className="w-full min-h-[48px]">
                  {t({ id: 'Daftar', en: 'Sign Up' })}
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
