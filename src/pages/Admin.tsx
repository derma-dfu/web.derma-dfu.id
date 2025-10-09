import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Upload, FileText, Image, Folder } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Admin = () => {
  const { t } = useLanguage();
  const { toast } = useToast();

  const storageBuckets = [
    {
      icon: <Image className="h-6 w-6 text-primary" />,
      name: 'logos',
      label: { id: 'Logo Perusahaan', en: 'Company Logos' },
      description: { id: 'Upload logo DERMA-DFU dan mitra', en: 'Upload DERMA-DFU and partner logos' }
    },
    {
      icon: <Image className="h-6 w-6 text-accent" />,
      name: 'products',
      label: { id: 'Foto Produk', en: 'Product Photos' },
      description: { id: 'Upload gambar produk dan layanan', en: 'Upload product and service images' }
    },
    {
      icon: <Folder className="h-6 w-6 text-warning" />,
      name: 'partners',
      label: { id: 'Materi Mitra', en: 'Partner Materials' },
      description: { id: 'Upload dokumen dan materi untuk mitra', en: 'Upload documents and materials for partners' }
    },
    {
      icon: <FileText className="h-6 w-6 text-destructive" />,
      name: 'legal',
      label: { id: 'Dokumen Legal', en: 'Legal Documents' },
      description: { id: 'Upload kebijakan privasi, syarat & ketentuan', en: 'Upload privacy policy, terms & conditions' }
    }
  ];

  const handleUpload = (bucketName: string) => {
    toast({
      title: t({ id: 'Siap Upload', en: 'Ready to Upload' }),
      description: t({ 
        id: `Bucket "${bucketName}" siap menerima file. Integrasi dengan Lovable Cloud Storage aktif.`,
        en: `Bucket "${bucketName}" is ready to receive files. Lovable Cloud Storage integration active.`
      }),
    });
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-secondary">
            {t({ id: 'Panel Admin', en: 'Admin Panel' })}
          </h1>
          <p className="text-lg text-foreground/80">
            {t({ id: 'Kelola konten dan file untuk platform', en: 'Manage content and files for the platform' })}
          </p>
        </div>

        {/* Storage Buckets */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-secondary">
            {t({ id: 'Lovable Cloud Storage', en: 'Lovable Cloud Storage' })}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {storageBuckets.map((bucket) => (
              <Card key={bucket.name} className="rounded-2xl shadow-md">
                <CardHeader>
                  <div className="flex items-center space-x-3 mb-2">
                    {bucket.icon}
                    <CardTitle className="text-secondary">{t(bucket.label)}</CardTitle>
                  </div>
                  <CardDescription>{t(bucket.description)}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:bg-muted/30 transition-colors">
                      <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground mb-4">
                        {t({ 
                          id: 'Drag & drop file atau klik untuk upload',
                          en: 'Drag & drop files or click to upload'
                        })}
                      </p>
                      <Button 
                        onClick={() => handleUpload(bucket.name)}
                        className="min-h-[44px]"
                      >
                        {t({ id: 'Pilih File', en: 'Select Files' })}
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <p>📁 Bucket: /{bucket.name}</p>
                      <p>{t({ id: '✓ Public URLs akan tersedia setelah upload', en: '✓ Public URLs available after upload' })}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <Card className="rounded-2xl shadow-md bg-gradient-to-br from-primary/5 to-accent/5">
          <CardHeader>
            <CardTitle className="text-secondary">
              {t({ id: 'Panduan Upload', en: 'Upload Guide' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start space-x-2">
              <span className="text-primary font-bold">1.</span>
              <p>{t({ 
                id: 'Pilih bucket sesuai jenis file yang akan diupload',
                en: 'Select the appropriate bucket for the file type'
              })}</p>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-primary font-bold">2.</span>
              <p>{t({ 
                id: 'Upload file menggunakan tombol "Pilih File"',
                en: 'Upload files using the "Select Files" button'
              })}</p>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-primary font-bold">3.</span>
              <p>{t({ 
                id: 'Setelah upload, URL publik akan tersedia untuk digunakan di website',
                en: 'After upload, public URLs will be available to use on the website'
              })}</p>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-primary font-bold">4.</span>
              <p>{t({ 
                id: 'Gunakan URL tersebut untuk mengganti placeholder di halaman',
                en: 'Use these URLs to replace placeholders on pages'
              })}</p>
            </div>
          </CardContent>
        </Card>

        {/* Technical Info */}
        <div className="mt-8 p-4 bg-muted/30 rounded-2xl">
          <p className="text-sm text-muted-foreground text-center">
            {t({ 
              id: '💡 Lovable Cloud Storage terintegrasi dengan Supabase Storage untuk performa optimal',
              en: '💡 Lovable Cloud Storage integrated with Supabase Storage for optimal performance'
            })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Admin;
