import { useCartStore } from '@/store/cart';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';

export function Cart() {
  const { items, removeItem, addItem, decreaseItem, getTotal } = useCartStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const total = getTotal();
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const handleCheckout = () => {
    const message = items
      .map((item) => `${item.product.name} x${item.quantity} - ${formatPrice(item.product.price * item.quantity)}`)
      .join('\n');
    const finalMessage = `Hola, quiero hacer este pedido:\n\n${message}\n\nTotal: ${formatPrice(total)}`;
    const encodedMessage = encodeURIComponent(finalMessage);
    // Replace with your phone number
    const phoneNumber = '573225766513'; 
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
  };

  if (!isClient) return null;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {itemCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col h-full">
        <SheetHeader>
          <SheetTitle>Tu Carrito</SheetTitle>
        </SheetHeader>
        <div className="mt-8 flex-1 overflow-y-auto pr-2">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-4">
              <ShoppingCart className="h-12 w-12 opacity-20" />
              <p>El carrito está vacío</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {items.map((item) => (
                <div key={item.product.id} className="flex gap-4 items-start border-b pb-4">
                  <div className="relative h-20 w-20 rounded-md overflow-hidden bg-white border flex-shrink-0">
                    {item.product.images?.[0]?.image_url ? (
                      <Image
                        src={item.product.images[0].image_url}
                        alt={item.product.name}
                        fill
                        className="object-contain p-1"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                        No img
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-medium line-clamp-2">{item.product.name}</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatPrice(item.product.price)}
                    </p>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2 border rounded-md p-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6"
                          onClick={() => decreaseItem(item.product.id)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm w-4 text-center">{item.quantity}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6"
                          onClick={() => addItem(item.product)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => removeItem(item.product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {items.length > 0 && (
          <div className="pt-6 border-t mt-auto">
            <div className="flex justify-center gap-2 font-bold text-2xl mb-4">
              <span>Total:</span>
              <span>{formatPrice(total)}</span>
            </div>
            <Button className="w-full size-lg" onClick={handleCheckout}>
              Enviar Pedido por WhatsApp
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
