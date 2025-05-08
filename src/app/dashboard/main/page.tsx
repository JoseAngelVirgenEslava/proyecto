'use client';
import React, { useEffect, useState } from 'react';
import { Element } from '@/app/components/Element';

interface Product {
  _id: string;
  name: string;
  price: number;
  short_description: string;
  full_description: string;
  category: string;
  units: number;
  img: string;
}

export default function MainPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/data');
        const data = await res.json();
        setProducts(data.productos || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <div className="text-center p-8">Cargando productos...</div>;
  }

  const handleAddToCart = (product: Product) => {
    console.log('Producto añadido:', product);
  };

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Productos disponibles</h2>

        <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {products.map((product) => (
            <Element 
            key={product._id}
            product={product}
            onAddToCart={handleAddToCart}
          />
          ))}
        </div>
      </div>
    </div>
  );
}