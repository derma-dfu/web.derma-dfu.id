import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import { BookOpen, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Education = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    const loadArticles = async () => {
      try {
        const { data, error } = await supabase
          .from('articles')
          .select('*')
          .eq('is_published', true)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        if (mounted) {
          setArticles(data || []);
        }
      } catch (error: any) {
        console.error('Error fetching articles:', error);
        if (mounted) {
          toast({
            title: t({ id: 'Error', en: 'Error' }),
            description: error.message,
            variant: 'destructive',
          });
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    loadArticles();
    
    return () => {
      mounted = false;
    };
  }, [toast, t]);


  const categories = [
    { value: 'all', label: { id: 'Semua', en: 'All' } },
    { value: 'wound_care', label: { id: 'Perawatan Luka', en: 'Wound Care' } },
    { value: 'treatment', label: { id: 'Perawatan', en: 'Treatment' } },
    { value: 'prevention', label: { id: 'Pencegahan', en: 'Prevention' } },
    { value: 'lifestyle', label: { id: 'Gaya Hidup', en: 'Lifestyle' } }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-secondary">
            {t({ id: 'Pusat Edukasi', en: 'Education Center' })}
          </h1>
          <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
            {t({ 
              id: 'Pelajari semua tentang perawatan luka diabetes dari sumber terpercaya',
              en: 'Learn everything about diabetic wound care from trusted sources'
            })}
          </p>
        </div>

        {/* Category Tabs */}
        <Tabs defaultValue="all" className="mb-8">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            {categories.map((cat) => (
              <TabsTrigger key={cat.value} value={cat.value} className="min-h-[44px]">
                {t(cat.label)}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((cat) => (
            <TabsContent key={cat.value} value={cat.value}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(cat.value === 'all' 
                  ? articles 
                  : articles.filter(a => a.category === cat.value)
                ).map((article) => (
                  <Card 
                    key={article.id} 
                    className="hover-scale rounded-2xl shadow-md cursor-pointer"
                  >
                    <CardHeader>
                      {article.image_url && (
                        <img 
                          src={article.image_url} 
                          alt={t({ id: article.title_id, en: article.title_en })} 
                          className="w-full h-48 object-cover rounded-lg mb-4"
                        />
                      )}
                      <div className="flex items-center space-x-3 mb-3">
                        <BookOpen className="h-5 w-5 text-primary" />
                        <span className="text-sm text-muted-foreground capitalize">{article.category.replace('_', ' ')}</span>
                      </div>
                      <CardTitle className="text-secondary">
                        {t({ id: article.title_id, en: article.title_en })}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base">
                        {article.excerpt_id 
                          ? t({ id: article.excerpt_id, en: article.excerpt_en }) 
                          : t({ id: article.content_id, en: article.content_en }).substring(0, 150) + '...'}
                      </CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Featured Section */}
        <div className="mt-16 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-8">
          <h2 className="text-3xl font-bold mb-6 text-secondary">
            {t({ id: 'Artikel Unggulan', en: 'Featured Articles' })}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="rounded-2xl">
              <CardHeader>
                <div className="text-4xl mb-4">📚</div>
                <CardTitle className="text-secondary">
                  {t({ id: 'Panduan Lengkap DFU', en: 'Complete DFU Guide' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {t({ 
                    id: 'E-book komprehensif tentang Diabetic Foot Ulcer',
                    en: 'Comprehensive e-book on Diabetic Foot Ulcer'
                  })}
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardHeader>
                <div className="text-4xl mb-4">🎓</div>
                <CardTitle className="text-secondary">
                  {t({ id: 'Webinar Gratis', en: 'Free Webinar' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {t({ 
                    id: 'Daftar untuk webinar bulanan dengan ahli',
                    en: 'Register for monthly webinar with experts'
                  })}
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Education;
