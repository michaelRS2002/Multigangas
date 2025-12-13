import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function CategoryManager({ onCategoryCreated }: { onCategoryCreated?: () => void }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('categories')
        .insert({ name: name.trim() });

      if (error) throw error;

      alert('Categoría creada exitosamente');
      setName('');
      if (onCategoryCreated) onCategoryCreated();
    } catch (error: any) {
      alert('Error al crear categoría: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mb-6">
      <CardHeader>
        <CardTitle>Crear Nueva Categoría</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex gap-4 items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="categoryName">Nombre de la Categoría</Label>
            <Input
              id="categoryName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Electrónica"
              required
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creando...' : 'Crear'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
