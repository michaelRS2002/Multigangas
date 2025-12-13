import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Category {
  id: string;
  name: string;
}

export function AdminForm() {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
  });
  const [files, setFiles] = useState<FileList | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name');
    if (data) setCategories(data);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCategoryChange = (value: string) => {
    setFormData({ ...formData, category_id: value });
  };


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(e.target.files);
    }
  };

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = src;
      img.onload = () => resolve(img);
      img.onerror = reject;
    });
  };

  const generateWatermark = async (file: File): Promise<Blob> => {
    const img = await loadImage(URL.createObjectURL(file));
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) throw new Error('Could not get canvas context');

    ctx.drawImage(img, 0, 0);

    try {
      const logo = await loadImage('/watermark.png');
      const logoWidth = img.width * 0.15;
      const logoHeight = logoWidth * (logo.height / logo.width);
      const padding = img.width * 0.05;
      const x = padding;
      const y = padding;

      ctx.globalAlpha = 0.25;
      ctx.drawImage(logo, x, y, logoWidth, logoHeight);
      ctx.globalAlpha = 1.0;
    } catch (error) {
      console.warn('Watermark image not found, skipping watermark');
    }

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas to Blob failed'));
      }, 'image/jpeg', 0.8);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files || files.length === 0) return alert('Please select at least one image');
    setLoading(true);

    try {
      // 1. Insert Product
      const { data: productData, error: productError } = await supabase
        .from('products')
        .insert({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          category_id: formData.category_id || null,
        })
        .select()
        .single();

      if (productError) throw productError;
      const productId = productData.id;

      // 2. Process Images
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Generate Watermarked
        const watermarkedBlob = await generateWatermark(file);
        const watermarkedFileObj = new File([watermarkedBlob], `wm-${file.name}`, { type: 'image/jpeg' });

        // Upload Original
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: originalError } = await supabase.storage
          .from('products')
          .upload(`original/${fileName}`, file);

        if (originalError) throw originalError;

        // Upload Watermarked
        const { error: wmError } = await supabase.storage
          .from('products')
          .upload(`watermarked/${fileName}`, watermarkedFileObj);

        if (wmError) throw wmError;

        // Get URLs
        const { data: { publicUrl: imageUrl } } = supabase.storage
          .from('products')
          .getPublicUrl(`original/${fileName}`);

        const { data: { publicUrl: watermarkedUrl } } = supabase.storage
          .from('products')
          .getPublicUrl(`watermarked/${fileName}`);

        // Insert Image Record
        const { error: imageError } = await supabase.from('product_images').insert({
          product_id: productId,
          image_url: imageUrl,
          watermarked_url: watermarkedUrl,
        });

        if (imageError) throw imageError;
      }

      alert('Product created successfully!');
      setFormData({ name: '', description: '', price: '', category_id: '' });
      setFiles(null);
      // Reset file input manually if needed, or just rely on state
      const fileInput = document.getElementById('image') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error: any) {
      console.error('Error:', error);
      alert('Error creating product: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Agregar Nuevo Producto</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Categoría</Label>
            <Select onValueChange={handleCategoryChange} value={formData.category_id}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Precio</Label>
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="image">Imágenes del Producto (Selecciona varias)</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              required
            />
            <p className="text-xs text-gray-500">Puedes seleccionar múltiples fotos a la vez.</p>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar Producto'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
