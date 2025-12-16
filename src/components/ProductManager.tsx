import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Product } from '@/store/cart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
}

export function ProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [productsResult, categoriesResult] = await Promise.all([
      supabase
        .from('products')
        .select('*, images:product_images(image_url, watermarked_url)')
        .order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name'),
    ]);

    if (productsResult.data) setProducts(productsResult.data);
    if (categoriesResult.data) setCategories(categoriesResult.data);
    setLoading(false);
  };

  const toggleStock = async (product: Product) => {
    const newValue = !product.is_out_of_stock;
    const { error } = await supabase
      .from('products')
      .update({ is_out_of_stock: newValue })
      .eq('id', product.id);

    if (error) {
      toast.error('Error al actualizar estado');
    } else {
      setProducts(
        products.map((p) =>
          p.id === product.id ? { ...p, is_out_of_stock: newValue } : p
        )
      );
      toast.success(newValue ? 'Marcado como Agotado' : 'Marcado como Disponible');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;

    const { error } = await supabase.from('products').delete().eq('id', id);

    if (error) {
      toast.error('Error al eliminar producto');
    } else {
      setProducts(products.filter((p) => p.id !== id));
      toast.success('Producto eliminado');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const { error } = await supabase
      .from('products')
      .update({
        name: editingProduct.name,
        description: editingProduct.description,
        price: editingProduct.price,
        category_id: editingProduct.category_id,
      })
      .eq('id', editingProduct.id);

    if (error) {
      toast.error('Error al actualizar producto');
    } else {
      setProducts(
        products.map((p) => (p.id === editingProduct.id ? editingProduct : p))
      );
      setIsDialogOpen(false);
      toast.success('Producto actualizado');
    }
  };

  if (loading) return <div>Cargando productos...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Administrar Productos</h2>
      <div className="grid gap-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="flex items-center justify-between p-4 border rounded-lg bg-white shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 rounded-md overflow-hidden bg-white border">
                {product.images?.[0]?.image_url && (
                  <Image
                    src={product.images[0].image_url}
                    alt={product.name}
                    fill
                    className="object-contain p-1"
                  />
                )}
                {product.is_out_of_stock && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">AGOTADO</span>
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-medium">{product.name}</h3>
                <p className="text-sm text-gray-500">{formatPrice(product.price)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={product.is_out_of_stock ? 'destructive' : 'outline'}
                size="sm"
                onClick={() => toggleStock(product)}
                title={product.is_out_of_stock ? 'Marcar como Disponible' : 'Marcar como Agotado'}
              >
                {product.is_out_of_stock ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              
              <Dialog open={isDialogOpen && editingProduct?.id === product.id} onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (open) setEditingProduct(product);
                else setEditingProduct(null);
              }}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Editar Producto</DialogTitle>
                  </DialogHeader>
                  {editingProduct && (
                    <form onSubmit={handleUpdate} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Nombre</Label>
                        <Input
                          value={editingProduct.name}
                          onChange={(e) =>
                            setEditingProduct({ ...editingProduct, name: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Descripción</Label>
                        <Textarea
                          value={editingProduct.description}
                          onChange={(e) =>
                            setEditingProduct({ ...editingProduct, description: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Precio</Label>
                        <Input
                          type="number"
                          value={editingProduct.price}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              price: parseFloat(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Categoría</Label>
                        <Select
                          value={editingProduct.category_id || ''}
                          onValueChange={(value) =>
                            setEditingProduct({ ...editingProduct, category_id: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar categoría" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button type="submit" className="w-full">
                        Guardar Cambios
                      </Button>
                    </form>
                  )}
                </DialogContent>
              </Dialog>

              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(product.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
