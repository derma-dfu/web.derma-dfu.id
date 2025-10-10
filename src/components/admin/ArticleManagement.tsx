import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';

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
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [uploading, setUploading] = useState(false);
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
      setArticles(data || []);
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

  const handleSubmit = async (e: React.FormEvent, imageUrl?: string) => {
    e.preventDefault();
    
    try {
      const articleData = {
        title_id: formData.title_id,
        title_en: formData.title_en,
        content_id: formData.content_id,
        content_en: formData.content_en,
        excerpt_id: formData.excerpt_id || null,
        excerpt_en: formData.excerpt_en || null,
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
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Article Management</h2>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Add Article</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingArticle ? 'Edit Article' : 'Add New Article'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Title (ID)</Label>
                  <Input
                    value={formData.title_id}
                    onChange={(e) => setFormData({ ...formData, title_id: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Title (EN)</Label>
                  <Input
                    value={formData.title_en}
                    onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Content (ID)</Label>
                <Textarea
                  value={formData.content_id}
                  onChange={(e) => setFormData({ ...formData, content_id: e.target.value })}
                  required
                  rows={6}
                />
              </div>

              <div>
                <Label>Content (EN)</Label>
                <Textarea
                  value={formData.content_en}
                  onChange={(e) => setFormData({ ...formData, content_en: e.target.value })}
                  required
                  rows={6}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                      await handleSubmit(e as any, url);
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
                {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingArticle ? 'Update' : 'Create'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {articles.map((article) => (
          <Card key={article.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{article.title_en}</CardTitle>
                  <p className="text-sm text-muted-foreground">{article.category}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(article)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(article.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm line-clamp-2">{article.content_en}</p>
              {article.image_url && (
                <img src={article.image_url} alt={article.title_en} className="mt-4 h-32 object-cover rounded" />
              )}
              <p className="text-xs text-muted-foreground mt-2">
                Status: {article.is_published ? '✓ Published' : '✗ Draft'}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
