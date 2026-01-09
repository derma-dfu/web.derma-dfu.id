import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

interface Partner {
  id: string;
  name: string;
  description_id: string | null;
  description_en: string | null;
  logo_url: string | null;
  website_url: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  status: string;
  is_active: boolean;
}

export const PartnerManagement = () => {
  const { t } = useLanguage();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [uploading, setUploading] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description_id: '',
    description_en: '',
    website_url: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    status: 'pending',
    is_active: true,
  });

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPartners((data as any) || []);
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
        .from('partner-logos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('partner-logos')
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
      // Use English description if provided, otherwise fallback to Indonesian
      const partnerData = {
        name: formData.name,
        description_id: formData.description_id || null,
        description_en: formData.description_en || formData.description_id || null,
        website_url: formData.website_url || null,
        contact_email: formData.contact_email || null,
        contact_phone: formData.contact_phone || null,
        address: formData.address || null,
        status: formData.status,
        is_active: formData.is_active,
        logo_url: logoUrl || editingPartner?.logo_url,
      };

      if (editingPartner) {
        const { error } = await supabase
          .from('partners')
          .update(partnerData)
          .eq('id', editingPartner.id);

        if (error) throw error;
        toast({ title: 'Partner updated successfully' });
      } else {
        const { error } = await supabase
          .from('partners')
          .insert([partnerData]);

        if (error) throw error;
        toast({ title: 'Partner created successfully' });
      }

      setDialogOpen(false);
      resetForm();
      fetchPartners();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this partner?')) return;

    try {
      const { error } = await supabase
        .from('partners')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Partner deleted successfully' });
      fetchPartners();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (partner: Partner) => {
    setEditingPartner(partner);
    setFormData({
      name: partner.name,
      description_id: partner.description_id || '',
      description_en: partner.description_en || '',
      website_url: partner.website_url || '',
      contact_email: partner.contact_email || '',
      contact_phone: partner.contact_phone || '',
      address: partner.address || '',
      status: partner.status,
      is_active: partner.is_active,
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingPartner(null);
    setLogoUrl(null);
    setFormData({
      name: '',
      description_id: '',
      description_en: '',
      website_url: '',
      contact_email: '',
      contact_phone: '',
      address: '',
      status: 'pending',
      is_active: true,
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
            <Button><Add01Icon className="mr-2 h-4 w-4" /> {t({ id: 'Tambah Mitra', en: 'Add Partner' })}</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPartner
                  ? t({ id: 'Edit Mitra', en: 'Edit Partner' })
                  : t({ id: 'Tambah Mitra Baru', en: 'Add New Partner' })}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Info banner */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                💡 {t({ id: 'Field English bersifat opsional. Jika dikosongkan, akan menggunakan teks Indonesia.', en: 'English fields are optional. If left empty, Indonesian text will be used.' })}
              </div>

              <div>
                <Label>{t({ id: 'Nama Partner', en: 'Partner Name' })} *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>{t({ id: 'Deskripsi (ID)', en: 'Description (ID)' })}</Label>
                  <Textarea
                    value={formData.description_id}
                    onChange={(e) => setFormData({ ...formData, description_id: e.target.value })}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Website URL</Label>
                  <Input
                    type="url"
                    value={formData.website_url}
                    onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Contact Email</Label>
                  <Input
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Contact Phone</Label>
                  <Input
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Address</Label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>{t({ id: 'Logo Partner', en: 'Partner Logo' })}</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const url = await handleImageUpload(e);
                    if (url) {
                      setLogoUrl(url);
                      toast({ title: t({ id: 'Logo berhasil diupload', en: 'Logo uploaded successfully' }) });
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
                {uploading && <Loading03Icon className="mr-2 h-4 w-4 animate-spin" />}
                {editingPartner ? 'Update' : 'Create'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Logo</TableHead>
              <TableHead>Partner Name</TableHead>
              <TableHead>Contact Info</TableHead>
              <TableHead>Website</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {partners.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  {t({ id: 'Belum ada data mitra.', en: 'No partners found.' })}
                </TableCell>
              </TableRow>
            ) : (
              partners.map((partner) => (
                <TableRow key={partner.id}>
                  <TableCell>
                    <div className="h-12 w-12 relative rounded overflow-hidden bg-slate-50 border flex items-center justify-center">
                      {partner.logo_url ? (
                        <img
                          src={partner.logo_url}
                          alt={partner.name}
                          className="h-10 w-10 object-contain"
                        />
                      ) : (
                        <Image02Icon className="h-6 w-6 text-slate-300" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold">{partner.name}</div>
                    <div className="text-xs text-muted-foreground max-w-[200px] truncate">
                      {partner.description_id}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {partner.contact_email && <div className="flex items-center gap-1">📧 {partner.contact_email}</div>}
                      {partner.contact_phone && <div className="flex items-center gap-1">📞 {partner.contact_phone}</div>}
                    </div>
                  </TableCell>
                  <TableCell>
                    {partner.website_url ? (
                      <a href={partner.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                        {partner.website_url}
                      </a>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${partner.is_active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                      }`}>
                      {partner.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(partner)}>
                        <Edit02Icon className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(partner.id)}>
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
