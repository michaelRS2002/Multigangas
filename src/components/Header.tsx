'use client';

import Link from 'next/link';
import { Cart } from '@/components/Cart';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-bold text-xl">
            Catálogo
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild className="hidden sm:flex">
            <Link href="https://chat.whatsapp.com/YOUR_GROUP_LINK" target="_blank">
              <Users className="mr-2 h-4 w-4" />
              Conviértete en Distribuidor
            </Link>
          </Button>
          {/* Mobile Icon only */}
          <Button variant="ghost" size="icon" asChild className="sm:hidden">
            <Link href="https://chat.whatsapp.com/YOUR_GROUP_LINK" target="_blank">
              <Users className="h-5 w-5" />
            </Link>
          </Button>
          <Cart />
        </div>
      </div>
    </header>
  );
}
