import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Loading03Icon,
  Add01Icon,
  Edit02Icon,
  Delete02Icon,
  Image02Icon
} from 'hugeicons-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLanguage } from '@/contexts/LanguageContext';

interface Article {
  id: string;
  title_id: string;
  title_en: string;
  content_id: string;
  content_en: string;
  excerpt_id: string | null;
  excerpt_en: string | null;
  category: string;
  image_url: string | null;
  is_published: boolean;
}

export const ArticleManagement = () => {
  const { t } = useLanguage();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title_id: '',
    title_en: '',
    content_id: '',
    content_en: '',
    excerpt_id: '',
    excerpt_en: '',
    category: 'wound_care' as 'wound_care' | 'prevention' | 'treatment' | 'lifestyle',
    is_published: false,
  });

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setArticles((data as any) || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('article-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('article-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error: any) {
      toast({
        title: 'Upload Failed',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Use English values if provided, otherwise fallback to Indonesian
      const articleData = {
        title_id: formData.title_id,
        title_en: formData.title_en || formData.title_id,
        content_id: formData.content_id,
        content_en: formData.content_en || formData.content_id,
        excerpt_id: formData.excerpt_id || null,
        excerpt_en: formData.excerpt_en || formData.excerpt_id || null,
        category: formData.category,
        is_published: formData.is_published,
        image_url: imageUrl || editingArticle?.image_url,
      };

      if (editingArticle) {
        const { error } = await supabase
          .from('articles')
          .update(articleData)
          .eq('id', editingArticle.id);

        if (error) throw error;
        toast({ title: 'Article updated successfully' });
      } else {
        const { error } = await supabase
          .from('articles')
          .insert([articleData]);

        if (error) throw error;
        toast({ title: 'Article created successfully' });
      }

      setDialogOpen(false);
      resetForm();
      fetchArticles();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;

    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Article deleted successfully' });
      fetchArticles();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (article: Article) => {
    setEditingArticle(article);
    setFormData({
      title_id: article.title_id,
      title_en: article.title_en,
      content_id: article.content_id,
      content_en: article.content_en,
      excerpt_id: article.excerpt_id || '',
      excerpt_en: article.excerpt_en || '',
      category: article.category as 'wound_care' | 'prevention' | 'treatment' | 'lifestyle',
      is_published: article.is_published,
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingArticle(null);
    setImageUrl(null);
    setFormData({
      title_id: '',
      title_en: '',
      content_id: '',
      content_en: '',
      excerpt_id: '',
      excerpt_en: '',
      category: 'wound_care' as 'wound_care' | 'prevention' | 'treatment' | 'lifestyle',
      is_published: false,
    });
  };

  if (loading) {
    return <div className="flex justify-center p-8"><Loading03Icon className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        {/* Title removed, handled by layout */}
        <div className="flex-1"></div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button><Add01Icon className="mr-2 h-4 w-4" /> {t({ id: 'Tambah Artikel', en: 'Add Article' })}</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingArticle
                  ? t({ id: 'Edit Artikel', en: 'Edit Article' })
                  : t({ id: 'Tambah Artikel Baru', en: 'Add New Article' })}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Info banner */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                💡 {t({ id: 'Field English bersifat opsional. Jika dikosongkan, akan menggunakan teks Indonesia.', en: 'English fields are optional. If left empty, Indonesian text will be used.' })}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>{t({ id: 'Judul (ID)', en: 'Title (ID)' })} *</Label>
                  <Input
                    value={formData.title_id}
                    onChange={(e) => setFormData({ ...formData, title_id: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>{t({ id: 'Judul (EN)', en: 'Title (EN)' })}</Label>
                  <Input
                    value={formData.title_en}
                    onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                    placeholder={t({ id: 'Opsional - gunakan Indonesia jika kosong', en: 'Optional - uses Indonesian if empty' })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>{t({ id: 'Konten (ID)', en: 'Content (ID)' })} *</Label>
                  <Textarea
                    value={formData.content_id}
                    onChange={(e) => setFormData({ ...formData, content_id: e.target.value })}
                    required
                    rows={6}
                  />
                </div>
                <div>
                  <Label>{t({ id: 'Konten (EN)', en: 'Content (EN)' })}</Label>
                  <Textarea
                    value={formData.content_en}
                    onChange={(e) => setFormData({ ...formData, content_en: e.target.value })}
                    placeholder={t({ id: 'Opsional - gunakan Indonesia jika kosong', en: 'Optional - uses Indonesian if empty' })}
                    rows={6}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Excerpt (ID)</Label>
                  <Textarea
                    value={formData.excerpt_id}
                    onChange={(e) => setFormData({ ...formData, excerpt_id: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Excerpt (EN)</Label>
                  <Textarea
                    value={formData.excerpt_en}
                    onChange={(e) => setFormData({ ...formData, excerpt_en: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>Category</Label>
                <Select value={formData.category} onValueChange={(value: 'wound_care' | 'prevention' | 'treatment' | 'lifestyle') => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wound_care">Wound Care</SelectItem>
                    <SelectItem value="prevention">Prevention</SelectItem>
                    <SelectItem value="treatment">Treatment</SelectItem>
                    <SelectItem value="lifestyle">Lifestyle</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Article Image</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const url = await handleImageUpload(e);
                    if (url) {
                      setImageUrl(url);
                      toast({ title: t({ id: 'Gambar berhasil diupload', en: 'Image uploaded successfully' }) });
                    }
                  }}
                  disabled={uploading}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.is_published}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                />
                <Label>Published</Label>
              </div>

              <Button type="submit" disabled={uploading}>
                {uploading && <Loading03Icon className="mr-2 h-4 w-4 animate-spin" />}
                {editingArticle ? 'Update' : 'Create'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Excerpt</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {articles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  {t({ id: 'Belum ada artikel.', en: 'No articles found.' })}
                </TableCell>
              </TableRow>
            ) : (
              articles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell>
                    <div className="h-12 w-16 relative rounded overflow-hidden bg-slate-50 border flex items-center justify-center">
                      {article.image_url ? (
                        <img
                          src={article.image_url}
                          alt={article.title_en}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Image02Icon className="h-6 w-6 text-slate-300" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold line-clamp-2 max-w-[200px]" title={article.title_en}>{article.title_en}</div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium ring-1 ring-inset ring-blue-700/10">
                      {article.category.replace('_', ' ')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground line-clamp-2 max-w-[250px]" title={article.excerpt_en || ''}>
                      {article.excerpt_en || '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${article.is_published
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-800'
                      }`}>
                      {article.is_published ? 'Published' : 'Draft'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(article)}>
                        <Edit02Icon className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(article.id)}>
                        <Delete02Icon className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
