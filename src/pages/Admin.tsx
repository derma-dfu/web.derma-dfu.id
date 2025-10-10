import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import { Loader2 } from 'lucide-react';
import { ProductManagement } from '@/components/admin/ProductManagement';
import { ArticleManagement } from '@/components/admin/ArticleManagement';
import { PartnerManagement } from '@/components/admin/PartnerManagement';

const Admin = () => {
  const { t } = useLanguage();
  const { isAdmin, isLoading } = useUserRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-secondary">
            {t({ id: 'Panel Admin', en: 'Admin Panel' })}
          </h1>
          <p className="text-lg text-foreground/80">
            {t({ id: 'Kelola konten dan data platform', en: 'Manage platform content and data' })}
          </p>
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="products">
              {t({ id: 'Produk', en: 'Products' })}
            </TabsTrigger>
            <TabsTrigger value="articles">
              {t({ id: 'Artikel', en: 'Articles' })}
            </TabsTrigger>
            <TabsTrigger value="partners">
              {t({ id: 'Mitra', en: 'Partners' })}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="mt-6">
            <ProductManagement />
          </TabsContent>

          <TabsContent value="articles" className="mt-6">
            <ArticleManagement />
          </TabsContent>

          <TabsContent value="partners" className="mt-6">
            <PartnerManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
