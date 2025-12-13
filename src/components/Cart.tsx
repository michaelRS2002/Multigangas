import { useCartStore } from '@/store/cart';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ShoppingCart, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export function Cart() {
  const { items, removeItem, getTotal } = useCartStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const total = getTotal();
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const handleCheckout = () => {
    const message = items
      .map((item) => `${item.product.name} x${item.quantity}`)
      .join('\n');
    const finalMessage = `Hola, quiero hacer este pedido:\n\n${message}\n\nTotal: $${total}`;
    const encodedMessage = encodeURIComponent(finalMessage);
    // Replace with your phone number
    const phoneNumber = '1234567890'; 
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
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Tu Carrito</SheetTitle>
        </SheetHeader>
        <div className="mt-8 flex flex-col gap-4">
          {items.length === 0 ? (
            <p className="text-center text-gray-500">El carrito está vacío</p>
          ) : (
            items.map((item) => (
              <div key={item.product.id} className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-medium">{item.product.name}</p>
                  <p className="text-sm text-gray-500">
                    ${item.product.price} x {item.quantity}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(item.product.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))
          )}
          {items.length > 0 && (
            <div className="mt-4">
              <div className="flex justify-between font-bold text-lg mb-4">
                <span>Total:</span>
                <span>${total}</span>
              </div>
              <Button className="w-full" onClick={handleCheckout}>
                Enviar Pedido por WhatsApp
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
