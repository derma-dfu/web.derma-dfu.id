import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Loading03Icon,
  Add01Icon,
  Edit02Icon,
  Delete02Icon,
  PlusSignIcon,
  Cancel01Icon,
  Settings02Icon,
  Image01Icon
} from 'hugeicons-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { Switch } from '@/components/ui/switch';
import { useLanguage } from '@/contexts/LanguageContext';

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
  price: number;
  is_active: boolean;
}

interface Category {
  id: string;
  name_id: string;
  name_en: string;
  slug: string;
  is_active: boolean;
}

// Default categories (fallback if database is empty)
const DEFAULT_CATEGORIES: Category[] = [
  { id: 'default-1', name_id: 'Perawatan Luka', name_en: 'Wound Dressing', slug: 'dressing', is_active: true },
  { id: 'default-2', name_id: 'Monitoring', name_en: 'Monitoring', slug: 'monitoring', is_active: true },
  { id: 'default-3', name_id: 'Konsultasi', name_en: 'Consultation', slug: 'consultation', is_active: true },
];

export const ProductManagement = () => {
  const { t, language } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const { toast } = useToast();

  // Category form data
  const [categoryFormData, setCategoryFormData] = useState({
    name_id: '',
    name_en: '',
    slug: '',
  });

  // Form data with features as arrays
  const [formData, setFormData] = useState({
    title_id: '',
    title_en: '',
    description_id: '',
    description_en: '',
    category: 'dressing',
    features_id: [''] as string[],
    features_en: [''] as string[],
    price: 100000, // Default 100k IDR
    is_active: true,
  });

  const fetchProducts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts((data as any) || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchCategories = useCallback(async () => {
    try {
      // Note: product_categories table needs to be created first
      // Using 'as any' to bypass TypeScript until migration is run
      const { data, error } = await (supabase as any)
        .from('product_categories')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) {
        // If table doesn't exist, use defaults
        console.log('Using default categories:', error.message);
        setCategories(DEFAULT_CATEGORIES);
        return;
      }

      if (data && data.length > 0) {
        setCategories(data as Category[]);
      } else {
        // Use defaults if no categories in database
        setCategories(DEFAULT_CATEGORIES);
      }
    } catch (error: any) {
      console.log('Categories fetch error, using defaults:', error.message);
      setCategories(DEFAULT_CATEGORIES);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

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
        title: 'Upload Gagal',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  // Feature management functions
  const addFeature = (lang: 'id' | 'en') => {
    if (lang === 'id') {
      setFormData(prev => ({
        ...prev,
        features_id: [...prev.features_id, '']
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        features_en: [...prev.features_en, '']
      }));
    }
  };

  const removeFeature = (lang: 'id' | 'en', index: number) => {
    if (lang === 'id') {
      setFormData(prev => ({
        ...prev,
        features_id: prev.features_id.filter((_, i) => i !== index)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        features_en: prev.features_en.filter((_, i) => i !== index)
      }));
    }
  };

  const updateFeature = (lang: 'id' | 'en', index: number, value: string) => {
    if (lang === 'id') {
      setFormData(prev => ({
        ...prev,
        features_id: prev.features_id.map((f, i) => i === index ? value : f)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        features_en: prev.features_en.map((f, i) => i === index ? value : f)
      }));
    }
  };

  // Category management functions
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const slug = categoryFormData.slug || categoryFormData.name_id.toLowerCase().replace(/\s+/g, '_');
      // Use English name if provided, otherwise fallback to Indonesian
      const name_en = categoryFormData.name_en || categoryFormData.name_id;

      if (editingCategory && !editingCategory.id.startsWith('default-')) {
        // Update existing category
        const { error } = await (supabase as any)
          .from('product_categories')
          .update({
            name_id: categoryFormData.name_id,
            name_en: name_en || categoryFormData.name_en,
            slug: slug,
          })
          .eq('id', editingCategory.id);

        if (error) throw error;
        toast({ title: t({ id: 'Kategori berhasil diperbarui', en: 'Category updated successfully' }) });
      } else {
        // Insert new category
        const { error } = await (supabase as any)
          .from('product_categories')
          .insert([{
            id: crypto.randomUUID(),
            name_id: categoryFormData.name_id,
            name_en: name_en,
            slug: slug,
            is_active: true,
          }]);

        if (error) throw error;
        toast({ title: t({ id: 'Kategori berhasil ditambahkan', en: 'Category added successfully' }) });
      }

      resetCategoryForm();
      fetchCategories();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleCategoryDelete = async (category: Category) => {
    if (category.id.startsWith('default-')) {
      toast({
        title: t({ id: 'Tidak bisa dihapus', en: 'Cannot delete' }),
        description: t({ id: 'Kategori default tidak bisa dihapus', en: 'Default categories cannot be deleted' }),
        variant: 'destructive',
      });
      return;
    }

    if (!confirm(t({ id: 'Apakah Anda yakin ingin menghapus kategori ini?', en: 'Are you sure you want to delete this category?' }))) return;

    try {
      const { error } = await (supabase as any)
        .from('product_categories')
        .delete()
        .eq('id', category.id);

      if (error) throw error;
      toast({ title: t({ id: 'Kategori berhasil dihapus', en: 'Category deleted successfully' }) });
      fetchCategories();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const openEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryFormData({
      name_id: category.name_id,
      name_en: category.name_en,
      slug: category.slug,
    });
  };

  const resetCategoryForm = () => {
    setEditingCategory(null);
    setCategoryFormData({
      name_id: '',
      name_en: '',
      slug: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Filter out empty features
      const cleanFeaturesId = formData.features_id.filter(f => f.trim() !== '');
      const cleanFeaturesEn = formData.features_en.filter(f => f.trim() !== '');

      // Use English values if provided, otherwise fallback to Indonesian
      const title_en = formData.title_en || formData.title_id;
      const description_en = formData.description_en || formData.description_id;
      const features_en = cleanFeaturesEn.length > 0 ? cleanFeaturesEn : cleanFeaturesId;

      const productData = {
        title_id: formData.title_id,
        title_en: title_en,
        description_id: formData.description_id,
        description_en: description_en,
        category: formData.category,
        features_id: cleanFeaturesId,
        features_en: features_en,
        price: formData.price,
        is_active: formData.is_active,
        // Use state imageUrl if set, otherwise keep existing image
        image_url: imageUrl || editingProduct?.image_url || null,
      };

      if (editingProduct) {
        const { error } = await (supabase as any)
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;
        toast({ title: t({ id: 'Produk berhasil diperbarui', en: 'Product updated successfully' }) });
      } else {
        const { error } = await (supabase as any)
          .from('products')
          .insert([{
            id: crypto.randomUUID(),
            ...productData
          }]);

        if (error) throw error;
        toast({ title: t({ id: 'Produk berhasil dibuat', en: 'Product created successfully' }) });
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

  const openDeleteConfirm = (id: string) => {
    setProductToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    try {
      const { error } = await (supabase as any)
        .from('products')
        .delete()
        .eq('id', productToDelete);

      if (error) throw error;
      toast({ title: t({ id: 'Produk berhasil dihapus', en: 'Product deleted successfully' }) });
      fetchProducts();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setProductToDelete(null);
    }
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      title_id: product.title_id,
      title_en: product.title_en,
      description_id: product.description_id,
      description_en: product.description_en,
      category: product.category,
      features_id: product.features_id?.length > 0 ? product.features_id : [''],
      features_en: product.features_en?.length > 0 ? product.features_en : [''],
      price: product.price || 100000,
      is_active: product.is_active,
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingProduct(null);
    setImageUrl(null);
    setFormData({
      title_id: '',
      title_en: '',
      description_id: '',
      description_en: '',
      category: categories[0]?.slug || 'dressing',
      features_id: [''],
      features_en: [''],
      price: 100000,
      is_active: true,
    });
  };

  // Get category display name
  const getCategoryName = (slug: string) => {
    const cat = categories.find(c => c.slug === slug);
    if (!cat) return slug;
    return language === 'id' ? cat.name_id : cat.name_en;
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
            <Button><Add01Icon className="mr-2 h-4 w-4" /> {t({ id: 'Tambah Produk', en: 'Add Product' })}</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct
                  ? t({ id: 'Edit Produk', en: 'Edit Product' })
                  : t({ id: 'Tambah Produk Baru', en: 'Add New Product' })}
              </DialogTitle>
              <DialogDescription className="sr-only">
                {editingProduct
                  ? t({ id: 'Form untuk mengedit produk', en: 'Form to edit product' })
                  : t({ id: 'Form untuk menambah produk baru', en: 'Form to add new product' })}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Info banner */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                💡 {t({ id: 'Field English bersifat opsional. Jika dikosongkan, akan menggunakan teks Indonesia.', en: 'English fields are optional. If left empty, Indonesian text will be used.' })}
              </div>

              {/* Title fields - always show both */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>{t({ id: 'Judul Produk (ID)', en: 'Product Title (ID)' })} *</Label>
                  <Input
                    value={formData.title_id}
                    onChange={(e) => setFormData({ ...formData, title_id: e.target.value })}
                    placeholder={t({ id: 'Masukkan judul produk', en: 'Enter product title' })}
                    required
                  />
                </div>
                <div>
                  <Label>{t({ id: 'Judul Produk (EN)', en: 'Product Title (EN)' })}</Label>
                  <Input
                    value={formData.title_en}
                    onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                    placeholder={t({ id: 'Opsional - gunakan Indonesia jika kosong', en: 'Optional - uses Indonesian if empty' })}
                  />
                </div>
              </div>

              {/* Description fields - always show both */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>{t({ id: 'Deskripsi (ID)', en: 'Description (ID)' })} *</Label>
                  <Textarea
                    value={formData.description_id}
                    onChange={(e) => setFormData({ ...formData, description_id: e.target.value })}
                    placeholder={t({ id: 'Masukkan deskripsi produk', en: 'Enter product description' })}
                    required
                  />
                </div>
                <div>
                  <Label>{t({ id: 'Deskripsi (EN)', en: 'Description (EN)' })}</Label>
                  <Textarea
                    value={formData.description_en}
                    onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                    placeholder={t({ id: 'Opsional - gunakan Indonesia jika kosong', en: 'Optional - uses Indonesian if empty' })}
                  />
                </div>
              </div>

              {/* Price Input */}
              <div>
                <Label>{t({ id: 'Harga (Rp)', en: 'Price (Rp)' })} *</Label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                  placeholder="100000"
                  min={0}
                  step={1000}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {t({ id: 'Masukkan harga dalam Rupiah (contoh: 100000 untuk Rp 100.000)', en: 'Enter price in Rupiah (e.g., 100000 for Rp 100,000)' })}
                </p>
              </div>

              {/* Category with Management Button */}
              <div>
                <Label>{t({ id: 'Kategori', en: 'Category' })}</Label>
                <div className="flex gap-2">
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.slug}>
                          {language === 'id' ? cat.name_id : cat.name_en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Dialog open={categoryDialogOpen} onOpenChange={(open) => {
                    setCategoryDialogOpen(open);
                    if (!open) resetCategoryForm();
                  }}>
                    <DialogTrigger asChild>
                      <Button type="button" variant="outline" size="icon" title={t({ id: 'Kelola Kategori', en: 'Manage Categories' })}>
                        <Settings02Icon className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>{t({ id: 'Kelola Kategori', en: 'Manage Categories' })}</DialogTitle>
                        <DialogDescription className="sr-only">
                          {t({ id: 'Form untuk mengelola kategori produk', en: 'Form to manage product categories' })}
                        </DialogDescription>
                      </DialogHeader>

                      {/* Category Form */}
                      <form onSubmit={handleCategorySubmit} className="space-y-4 border-b pb-4">
                        {/* Info banner */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-xs text-blue-700">
                          💡 {t({ id: 'Field English opsional. Jika kosong, gunakan teks Indonesia.', en: 'English field is optional. Uses Indonesian if empty.' })}
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                          <div>
                            <Label>{t({ id: 'Nama Kategori (ID)', en: 'Category Name (ID)' })} *</Label>
                            <Input
                              value={categoryFormData.name_id}
                              onChange={(e) => setCategoryFormData({ ...categoryFormData, name_id: e.target.value })}
                              placeholder={t({ id: 'Contoh: Perawatan Luka', en: 'Example: Wound Care' })}
                              required
                            />
                          </div>
                          <div>
                            <Label>{t({ id: 'Nama Kategori (EN)', en: 'Category Name (EN)' })}</Label>
                            <Input
                              value={categoryFormData.name_en}
                              onChange={(e) => setCategoryFormData({ ...categoryFormData, name_en: e.target.value })}
                              placeholder={t({ id: 'Opsional - gunakan Indonesia jika kosong', en: 'Optional - uses Indonesian if empty' })}
                            />
                          </div>
                          <div>
                            <Label>{t({ id: 'Slug (opsional)', en: 'Slug (optional)' })}</Label>
                            <Input
                              value={categoryFormData.slug}
                              onChange={(e) => setCategoryFormData({ ...categoryFormData, slug: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                              placeholder={t({ id: 'Otomatis dari nama', en: 'Auto-generated from name' })}
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button type="submit" className="flex-1">
                            <PlusSignIcon className="mr-2 h-4 w-4" />
                            {editingCategory ? t({ id: 'Perbarui', en: 'Update' }) : t({ id: 'Tambah Kategori', en: 'Add Category' })}
                          </Button>
                          {editingCategory && (
                            <Button type="button" variant="outline" onClick={resetCategoryForm}>
                              {t({ id: 'Batal', en: 'Cancel' })}
                            </Button>
                          )}
                        </div>
                      </form>

                      {/* Category List */}
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        <Label className="text-sm text-muted-foreground">{t({ id: 'Daftar Kategori', en: 'Category List' })}</Label>
                        {categories.map((cat) => (
                          <div key={cat.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100">
                            <div>
                              <p className="font-medium text-sm">{cat.name_id}</p>
                              <p className="text-xs text-muted-foreground">{cat.name_en}</p>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => openEditCategory(cat)}
                              >
                                <Edit02Icon className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={() => handleCategoryDelete(cat)}
                              >
                                <Delete02Icon className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Dynamic Features Input - Both Languages */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Indonesian Features */}
                <div className="space-y-2 border p-4 rounded-lg bg-slate-50">
                  <Label>{t({ id: 'Fitur Produk (ID)', en: 'Product Features (ID)' })} *</Label>
                  <div className="space-y-2">
                    {formData.features_id.map((feature, idx) => (
                      <div key={idx} className="flex gap-2">
                        <Input
                          value={feature}
                          onChange={(e) => updateFeature('id', idx, e.target.value)}
                          placeholder={`${t({ id: 'Fitur', en: 'Feature' })} ${idx + 1}`}
                          className="flex-1"
                        />
                        {formData.features_id.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFeature('id', idx)}
                            className="h-10 w-10 text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Cancel01Icon className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addFeature('id')}
                    className="mt-2"
                  >
                    <PlusSignIcon className="mr-2 h-4 w-4" />
                    {t({ id: 'Tambah Fitur', en: 'Add Feature' })}
                  </Button>
                </div>

                {/* English Features */}
                <div className="space-y-2 border p-4 rounded-lg bg-slate-50">
                  <Label>{t({ id: 'Fitur Produk (EN)', en: 'Product Features (EN)' })}</Label>
                  <p className="text-xs text-muted-foreground mb-2">{t({ id: 'Opsional - gunakan Indonesia jika kosong', en: 'Optional - uses Indonesian if empty' })}</p>
                  <div className="space-y-2">
                    {formData.features_en.map((feature, idx) => (
                      <div key={idx} className="flex gap-2">
                        <Input
                          value={feature}
                          onChange={(e) => updateFeature('en', idx, e.target.value)}
                          placeholder={`Feature ${idx + 1}`}
                          className="flex-1"
                        />
                        {formData.features_en.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFeature('en', idx)}
                            className="h-10 w-10 text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Cancel01Icon className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addFeature('en')}
                    className="mt-2"
                  >
                    <PlusSignIcon className="mr-2 h-4 w-4" />
                    {t({ id: 'Tambah Fitur', en: 'Add Feature' })}
                  </Button>
                </div>
              </div>

              <div>
                <Label>{t({ id: 'Gambar Produk', en: 'Product Image' })}</Label>
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
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label>{t({ id: 'Aktif', en: 'Active' })}</Label>
              </div>

              <Button type="submit" disabled={uploading} className="w-full">
                {uploading && <Loading03Icon className="mr-2 h-4 w-4 animate-spin" />}
                {editingProduct ? t({ id: 'Perbarui', en: 'Update' }) : t({ id: 'Simpan', en: 'Save' })}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-[800px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">{t({ id: 'Gambar', en: 'Image' })}</TableHead>
                <TableHead>{t({ id: 'Nama Produk', en: 'Product Name' })}</TableHead>
                <TableHead className="w-[120px]">{t({ id: 'Harga', en: 'Price' })}</TableHead>
                <TableHead className="w-[120px]">{t({ id: 'Kategori', en: 'Category' })}</TableHead>
                <TableHead className="w-[100px]">{t({ id: 'Status', en: 'Status' })}</TableHead>
                <TableHead>{t({ id: 'Fitur', en: 'Features' })}</TableHead>
                <TableHead className="w-[100px] text-right">{t({ id: 'Aksi', en: 'Actions' })}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {t({ id: 'Belum ada produk. Klik "Tambah Produk" untuk menambahkan.', en: 'No products yet. Click "Add Product" to create one.' })}
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id} className="hover:bg-slate-50">
                    {/* Thumbnail */}
                    <TableCell>
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.title_id}
                          className="w-12 h-12 object-cover rounded-lg border"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                          <Image01Icon className="w-5 h-5 text-slate-400" />
                        </div>
                      )}
                    </TableCell>

                    {/* Product Name & Description */}
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-900">{product.title_id}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1 max-w-[300px]">
                          {product.description_id}
                        </p>
                      </div>
                    </TableCell>

                    {/* Price */}
                    <TableCell>
                      <span className="font-medium text-green-600">
                        Rp {(product.price || 0).toLocaleString('id-ID')}
                      </span>
                    </TableCell>

                    {/* Category Badge */}
                    <TableCell>
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                        {getCategoryName(product.category)}
                      </Badge>
                    </TableCell>

                    {/* Status Badge */}
                    <TableCell>
                      {product.is_active ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-200">
                          {t({ id: 'Aktif', en: 'Active' })}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-red-50 text-red-600 hover:bg-red-100">
                          {t({ id: 'Nonaktif', en: 'Inactive' })}
                        </Badge>
                      )}
                    </TableCell>

                    {/* Features */}
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {product.features_id && product.features_id.length > 0 ? (
                          <>
                            {product.features_id.slice(0, 2).map((feature, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                            {product.features_id.length > 2 && (
                              <Badge variant="outline" className="text-xs bg-slate-50">
                                +{product.features_id.length - 2}
                              </Badge>
                            )}
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEditDialog(product)}
                        >
                          <Edit02Icon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            openDeleteConfirm(product.id);
                          }}
                        >
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

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title={t({ id: 'Hapus Produk', en: 'Delete Product' })}
        description={t({
          id: 'Apakah Anda yakin ingin menghapus produk ini? Tindakan ini tidak dapat dibatalkan.',
          en: 'Are you sure you want to delete this product? This action cannot be undone.'
        })}
        confirmLabel={t({ id: 'Hapus', en: 'Delete' })}
        cancelLabel={t({ id: 'Batal', en: 'Cancel' })}
        onConfirm={confirmDelete}
        variant="destructive"
      />
    </div>
  );
};
