// app/components/Element.tsx
'use client';

import React, { forwardRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

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
    // Log para ver el producto que recibe el componente
    console.log("Element.tsx - Rendering product:", product);

    const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        if (product) { // Asegurarse que product no sea null o undefined
            onAddToCart?.(product);
        } else {
            console.error("Element.tsx - onAddToCart_called_with_null_product");
        }
    };

    // Try-catch para capturar errores de renderizado dentro de este componente
    try {
        if (!product || typeof product._id === 'undefined') {
            console.error("Element.tsx - Producto inválido o sin _id, no se renderizará:", product);
            return <div ref={ref} className="text-red-500 p-4 border border-red-300 rounded-md">Error: Producto inválido.</div>;
        }
        if (!product.name) {
             console.warn("Element.tsx - Producto sin nombre:", product);
             // Podrías retornar un placeholder o un mensaje de error si es crítico
        }
        if (!product.img) {
            console.warn("Element.tsx - Producto sin imagen (img):", product);
            // Considera un placeholder si la imagen es opcional o si esto es un error
        }


        return (
            <div
                ref={ref}
                className={`relative bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl w-64 ${className}`}
            >
                <Link
                    href={`/producto/${product._id}`} // Asegúrate que product._id es un string válido para URL
                    className="block group cursor-pointer"
                >
                    <div className="aspect-square w-full overflow-hidden rounded-t-lg bg-gray-200">
                        <Image
                            src={product.img || "https://placehold.co/256x256/E0E0E0/BDBDBD?text=Sin+Imagen"} // Fallback si product.img es nulo/undefined
                            alt={product.name || "Producto sin nombre"} // Fallback para alt
                            width={256}
                            height={256}
                            className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                            priority={false}
                            onError={(e) => {
                                console.error(`Element.tsx - Error al cargar imagen para ${product.name} (ID: ${product._id}): ${product.img}`, e);
                                // Opcional: cambiar la fuente de la imagen a un placeholder si falla la carga
                                // e.currentTarget.srcset = "https://placehold.co/256x256/E0E0E0/BDBDBD?text=Error+Img";
                                // e.currentTarget.src = "https://placehold.co/256x256/E0E0E0/BDBDBD?text=Error+Img";
                            }}
                        />
                    </div>
                    <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2 truncate" title={product.name}>
                            {product.name || "Nombre no disponible"}
                        </h3>
                        <p className="text-sm text-gray-700 mb-1 h-10 overflow-hidden">
                            {product.short_description || "Descripción corta no disponible."}
                        </p>
                        <p className="text-sm font-medium text-gray-900 mb-1">
                            Precio: ${typeof product.price === 'number' ? product.price.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'N/A'}
                        </p>
                    </div>
                </Link>

                <div className="p-4 pt-0 flex flex-col">
                    <p className="text-sm font-medium text-gray-900 mb-1">
                        Unidades: {typeof product.units === 'number' ? product.units : 'N/A'}
                    </p>
                    <p className="text-sm font-medium text-gray-900 mb-2">
                        Categoría: {product.category || "N/A"}
                    </p>
                    <div className="mt-auto flex justify-end">
                        <button
                            onClick={handleButtonClick}
                            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                            disabled={!product || product.units <= 0} // Deshabilitar si no hay producto o no hay unidades
                        >
                            {product && product.units > 0 ? 'Añadir al carrito' : 'No disponible'}
                        </button>
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        console.error("Element.tsx - Error durante el renderizado del producto:", product, error);
        return <div ref={ref} className="text-red-700 p-4 border border-red-500 rounded-md">Error al mostrar este producto.</div>;
    }
});

Element.displayName = 'Element';