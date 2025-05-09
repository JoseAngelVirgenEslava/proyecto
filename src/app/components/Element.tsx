'use client';

import React, { forwardRef } from 'react';
import Image from 'next/image';

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

interface ElementProps {
    product: Product;
    className?: string;
    onAddToCart?: (product: Product) => void;
}

export const Element = forwardRef<HTMLDivElement, ElementProps>(({
    product,
    className = '',
    onAddToCart
}, ref) => {
    return (
        <div
            ref={ref} // Aplicamos la ref al div principal
            className={`group relative bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl w-64 ${className}`}
        >
            {/* Imagen del producto */}
            <div className="aspect-square w-full overflow-hidden rounded-t-lg bg-gray-200">
                <img
                    src={product.img}
                    alt={product.name}
                    className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />
                <Image
                    src={product.img}
                    alt={product.name}
                    width={200}
                    height={200}
                    className="object-cover w-full h-full"
                    priority={false}
                ></Image>
            </div>

            <div className="p-4 flex flex-col">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {product.name}
                </h3>
                <p className="text-sm text-gray-700 mb-1">
                    {product.short_description}
                </p>
                <p className="text-sm font-medium text-gray-900 mb-1">
                    Precio: ${product.price.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-sm font-medium text-gray-900 mb-1">
                    Unidades disponibles: {product.units}
                </p>
                <p className="text-sm font-medium text-gray-900 mb-2">
                    Categoría: {product.category}
                </p>

                {/* Botón de acción */}
                <div className="mt-auto flex justify-end">
                    <button
                        onClick={() => onAddToCart?.(product)}
                        className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                    >
                        Añadir al carrito
                    </button>
                </div>
            </div>
        </div>
    );
});

Element.displayName = 'Element';