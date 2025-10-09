import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import { BookOpen, Video, FileText } from 'lucide-react';

const Education = () => {
  const { t } = useLanguage();

  const categories = [
    { value: 'all', label: { id: 'Semua', en: 'All' } },
    { value: 'basics', label: { id: 'Dasar', en: 'Basics' } },
    { value: 'treatment', label: { id: 'Perawatan', en: 'Treatment' } },
    { value: 'prevention', label: { id: 'Pencegahan', en: 'Prevention' } }
  ];

  const articles = [
    {
      category: 'basics',
      icon: <BookOpen className="h-6 w-6 text-primary" />,
      title: { id: 'Apa itu Diabetic Foot Ulcer?', en: 'What is Diabetic Foot Ulcer?' },
      description: { 
        id: 'Panduan lengkap memahami luka kaki diabetes dan penyebabnya',
        en: 'Complete guide to understanding diabetic foot ulcers and their causes'
      },
      readTime: '5 min'
    },
    {
      category: 'treatment',
      icon: <Video className="h-6 w-6 text-primary" />,
      title: { id: 'Cara Merawat Luka Diabetes di Rumah', en: 'How to Care for Diabetic Wounds at Home' },
      description: { 
        id: 'Video tutorial perawatan luka diabetes yang aman dan efektif',
        en: 'Video tutorial for safe and effective diabetic wound care'
      },
      readTime: '10 min'
    },
    {
      category: 'prevention',
      icon: <FileText className="h-6 w-6 text-primary" />,
      title: { id: 'Mencegah Komplikasi Luka Diabetes', en: 'Preventing Diabetic Wound Complications' },
      description: { 
        id: 'Tips dan strategi mencegah infeksi dan komplikasi',
        en: 'Tips and strategies to prevent infections and complications'
      },
      readTime: '7 min'
    },
    {
      category: 'basics',
      icon: <BookOpen className="h-6 w-6 text-primary" />,
      title: { id: 'Tanda-tanda Bahaya Luka Kaki', en: 'Warning Signs of Foot Wounds' },
      description: { 
        id: 'Kenali gejala yang memerlukan penanganan medis segera',
        en: 'Recognize symptoms that require immediate medical attention'
      },
      readTime: '4 min'
    },
    {
      category: 'treatment',
      icon: <Video className="h-6 w-6 text-primary" />,
      title: { id: 'Pemilihan Pembalut yang Tepat', en: 'Choosing the Right Dressing' },
      description: { 
        id: 'Panduan memilih jenis pembalut sesuai kondisi luka',
        en: 'Guide to selecting the appropriate dressing for wound conditions'
      },
      readTime: '6 min'
    },
    {
      category: 'prevention',
      icon: <FileText className="h-6 w-6 text-primary" />,
      title: { id: 'Perawatan Kaki untuk Penderita Diabetes', en: 'Foot Care for Diabetes Patients' },
      description: { 
        id: 'Rutinitas harian untuk menjaga kesehatan kaki',
        en: 'Daily routines to maintain foot health'
      },
      readTime: '8 min'
    }
  ];

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
          <TabsList className="grid w-full grid-cols-4 mb-8">
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
                ).map((article, index) => (
                  <Card 
                    key={index} 
                    className="hover-scale rounded-2xl shadow-md cursor-pointer"
                  >
                    <CardHeader>
                      <div className="flex items-center space-x-3 mb-3">
                        {article.icon}
                        <span className="text-sm text-muted-foreground">{article.readTime}</span>
                      </div>
                      <CardTitle className="text-secondary">{t(article.title)}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base">
                        {t(article.description)}
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
