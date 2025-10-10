import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Edit, Trash2, Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';

interface Product {
  id: string;
  title_id: string;
  title_en: string;
  description_id: string;
  description_en: string;
  category: string;
  image_url: string | null;
  features_id: string[];
  features_en: string[];
  is_active: boolean;
}

export const ProductManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title_id: '',
    title_en: '',
    description_id: '',
    description_en: '',
    category: 'dressing' as 'dressing' | 'monitoring' | 'consultation',
    features_id: '',
    features_en: '',
    is_active: true,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
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
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
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
      const productData = {
        title_id: formData.title_id,
        title_en: formData.title_en,
        description_id: formData.description_id,
        description_en: formData.description_en,
        category: formData.category,
        features_id: formData.features_id.split(',').map(f => f.trim()),
        features_en: formData.features_en.split(',').map(f => f.trim()),
        is_active: formData.is_active,
        image_url: imageUrl || editingProduct?.image_url,
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;
        toast({ title: 'Product updated successfully' });
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData]);

        if (error) throw error;
        toast({ title: 'Product created successfully' });
      }

      setDialogOpen(false);
      resetForm();
      fetchProducts();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Product deleted successfully' });
      fetchProducts();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      title_id: product.title_id,
      title_en: product.title_en,
      description_id: product.description_id,
      description_en: product.description_en,
      category: product.category as 'dressing' | 'monitoring' | 'consultation',
      features_id: product.features_id.join(', '),
      features_en: product.features_en.join(', '),
      is_active: product.is_active,
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      title_id: '',
      title_en: '',
      description_id: '',
      description_en: '',
      category: 'dressing' as 'dressing' | 'monitoring' | 'consultation',
      features_id: '',
      features_en: '',
      is_active: true,
    });
  };

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Product Management</h2>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Add Product</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
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
                <Label>Description (ID)</Label>
                <Textarea
                  value={formData.description_id}
                  onChange={(e) => setFormData({ ...formData, description_id: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label>Description (EN)</Label>
                <Textarea
                  value={formData.description_en}
                  onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label>Category</Label>
                <Select value={formData.category} onValueChange={(value: 'dressing' | 'monitoring' | 'consultation') => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dressing">Wound Dressing</SelectItem>
                    <SelectItem value="monitoring">Monitoring</SelectItem>
                    <SelectItem value="consultation">Consultation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Features (ID) - comma separated</Label>
                <Input
                  value={formData.features_id}
                  onChange={(e) => setFormData({ ...formData, features_id: e.target.value })}
                  placeholder="Feature 1, Feature 2, Feature 3"
                />
              </div>

              <div>
                <Label>Features (EN) - comma separated</Label>
                <Input
                  value={formData.features_en}
                  onChange={(e) => setFormData({ ...formData, features_en: e.target.value })}
                  placeholder="Feature 1, Feature 2, Feature 3"
                />
              </div>

              <div>
                <Label>Product Image</Label>
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
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label>Active</Label>
              </div>

              <Button type="submit" disabled={uploading}>
                {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingProduct ? 'Update' : 'Create'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {products.map((product) => (
          <Card key={product.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{product.title_en}</CardTitle>
                  <p className="text-sm text-muted-foreground">{product.category}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(product)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(product.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{product.description_en}</p>
              {product.image_url && (
                <img src={product.image_url} alt={product.title_en} className="mt-4 h-32 object-cover rounded" />
              )}
              <p className="text-xs text-muted-foreground mt-2">
                Status: {product.is_active ? '✓ Active' : '✗ Inactive'}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
