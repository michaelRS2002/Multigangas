import { supabase } from '@/lib/supabase';
import { ProductGrid } from '@/components/ProductGrid';
import { Header } from '@/components/Header';

export const revalidate = 0; // Disable caching for this demo to see updates immediately

export default async function Home() {
  const { data: products, error } = await supabase
    .from('products')
    .select('*, images:product_images(image_url, watermarked_url)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto py-8">
        <div className="flex flex-col items-center mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Nuestros Productos</h1>
          <p className="text-gray-500 max-w-2xl px-4">
            Explora nuestro catálogo exclusivo. Descarga imágenes con marca de agua y haz tu pedido por WhatsApp.
          </p>
        </div>
        
        {products && products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <div className="text-center py-20">
            <p className="text-xl text-gray-500">No hay productos disponibles.</p>
            <p className="text-sm text-gray-400 mt-2">Ve a /admin para agregar productos.</p>
          </div>
        )}
      </div>
    </main>
  );
}
