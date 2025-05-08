'use client';

import React from 'react';
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

export const Element: React.FC<ElementProps> = ({
    product,
    className = '',
    onAddToCart
}) => {
    return (
        <div className={`group relative bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl ${className}`}>
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

            <div className="p-4">
                <div className="flex justify-between items-start">
                    <h3 className="text-sm text-gray-700">
                        <span aria-hidden="true" className="absolute inset-0" />
                        {product.name}
                    </h3>
                    <p className="text-sm font-medium text-gray-900">
                        {product.short_description}
                    </p>
                </div>
                <p className="text-sm font-medium text-gray-900">
                    ${product.price.toFixed(2)}
                </p>
                <p className="text-sm font-medium text-gray-900">
                    {product.units}
                </p>
                <p className="text-sm font-medium text-gray-900">
                    {product.category}
                </p>

                {/* Botón de acción */}
                <div className="mt-4 flex justify-end">
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
};