import Image from 'next/image';
import { useState } from 'react';
import { Product } from '@/store/cart';
import { useCartStore } from '@/store/cart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, ShoppingCart, Copy, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = product.images || [];
  const currentImage = images[currentImageIndex];

  const handleAddToCart = () => {
    if (product.is_out_of_stock) return;
    addItem(product);
    toast.success('Producto agregado al carrito', {
      duration: 2000,
    });
  };

  const handleDownload = async () => {
    if (!currentImage) return;
    const url = currentImage.watermarked_url || currentImage.image_url;
    if (!url) return;

    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${product.name}-${currentImageIndex + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  const handleDownloadAll = async () => {
    if (images.length === 0) return;
    
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const url = img.watermarked_url || img.image_url;
      if (!url) continue;

      try {
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `${product.name}-${i + 1}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
        // Small delay to prevent browser blocking multiple downloads
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error('Error downloading image:', error);
      }
    }
  };

  const handleCopyDescription = () => {
    const text = `*${product.name}*\nPrecio: $${product.price}\n\n${product.description}`;
    navigator.clipboard.writeText(text);
    alert('Información del producto copiada');
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <Card className="w-full max-w-sm mx-auto overflow-hidden">
      <div className="relative h-64 w-full group">
        {currentImage ? (
          <Image
            src={currentImage.image_url}
            alt={`${product.name} - Image ${currentImageIndex + 1}`}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-200">
            No Image
          </div>
        )}
        
        {images.length > 1 && (
          <>
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
              onClick={prevImage}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
              onClick={nextImage}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {images.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`h-1.5 w-1.5 rounded-full ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                />
              ))}
            </div>
          </>
        )}
        {product.is_out_of_stock && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold z-10">
            AGOTADO
          </div>
        )}
      </div>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{product.name}</span>
          <span className="text-lg font-bold">${product.price}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 line-clamp-3">{product.description}</p>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button 
          className="w-full" 
          onClick={handleAddToCart}
          disabled={product.is_out_of_stock}
          variant={product.is_out_of_stock ? "secondary" : "default"}
        >
          {product.is_out_of_stock ? (
            'Agotado'
          ) : (
            <>
              <ShoppingCart className="mr-2 h-4 w-4" /> Agregar al Carrito
            </>
          )}
        </Button>
        <div className="grid grid-cols-2 gap-2 w-full">
          <Button variant="outline" className="w-full" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" /> {images.length > 1 ? 'Foto' : 'Descargar'}
          </Button>
          {images.length > 1 && (
             <Button variant="outline" className="w-full" onClick={handleDownloadAll}>
             <Download className="mr-2 h-4 w-4" /> Todas
           </Button>
          )}
          <Button 
            variant="outline" 
            className={`w-full ${images.length > 1 ? 'col-span-2' : ''}`} 
            onClick={handleCopyDescription}
          >
            <Copy className="mr-2 h-4 w-4" /> Copiar Info
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
