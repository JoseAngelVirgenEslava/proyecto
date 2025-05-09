'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

interface CartItem extends Product { // Para la función handleAddToCart
    quantity: number;
}

export default function ProductDetailPage() {
    const params = useParams(); // Hook para obtener los parámetros de la ruta (ej. el id)
    const router = useRouter(); // Hook para la navegación (ej. para el botón "volver")
    const productId = params.id as string; // 'id' coincide con el nombre de la carpeta [id]

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (productId) {
            const fetchProductDetails = async () => {
                setLoading(true);
                setError(null);
                try {
                    const res = await fetch(`/api/producto/${productId}`);
                    if (!res.ok) {
                        const errorData = await res.json().catch(() => ({ message: `Error ${res.status}: No se pudo obtener el producto.` }));
                        throw new Error(errorData.message);
                    }
                    const data = await res.json();
                    setProduct(data.producto || data); 
                } catch (err: any) {
                    console.error("Error al cargar detalles del producto:", err);
                    setError(err.message || "No se pudieron cargar los detalles del producto.");
                    toast.error(err.message || "Error al cargar los detalles.");
                } finally {
                    setLoading(false);
                }
            };
            fetchProductDetails();
        } else {
            setLoading(false);
            setError("ID de producto no encontrado en la URL.");
        }
    }, [productId]);

    const handleAddToCartProductPage = (productToAdd: Product | null) => {
        if (!productToAdd) return;

        if (productToAdd.units <= 0) {
            toast.warn(`${productToAdd.name} no tiene unidades disponibles.`);
            return;
        }

        const storedCart = localStorage.getItem('cart');
        let cart: CartItem[] = storedCart ? JSON.parse(storedCart) : [];
        const existingItemIndex = cart.findIndex(item => item._id === productToAdd._id);

        if (existingItemIndex > -1) {
            if (cart[existingItemIndex].quantity < productToAdd.units) {
                cart[existingItemIndex].quantity += 1;
                toast.success(`${productToAdd.name} cantidad aumentada en el carrito.`);
            } else {
                toast.info(`No puedes añadir más unidades de ${productToAdd.name} (máximo ${productToAdd.units} en stock).`);
                return;
            }
        } else {
            cart.push({ ...productToAdd, quantity: 1 });
            toast.success(`${productToAdd.name} añadido al carrito!`);
        }
        localStorage.setItem('cart', JSON.stringify(cart));
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen text-xl">Cargando...</div>;
    }

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center h-screen text-center px-4">
                <p className="text-red-600 text-xl mb-4">{error}</p>
                <button
                    onClick={() => router.back()}
                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                    Volver
                </button>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="flex flex-col justify-center items-center h-screen text-center px-4">
                <p className="text-xl mb-4">Producto no encontrado.</p>
                <button
                    onClick={() => router.back()}
                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                    Volver
                </button>
            </div>
        );
    }

    return (
        <>
            <ToastContainer newestOnTop />
            <div className="container mx-auto min-h-screen p-4 sm:p-6 lg:p-8">
                <div className="mb-6">
                    <button
                        onClick={() => router.back()} // router.back() para volver a la página anterior
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                        Volver
                    </button>
                </div>

                <article className="bg-white shadow-xl rounded-lg overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2">
                        <div className="relative w-full h-64 md:h-auto md:min-h-[400px] lg:min-h-[500px]"> {/* Altura mínima para md y lg */}
                            <Image
                                src={product.img}
                                alt={product.name}
                                fill
                                style={{ objectFit: 'contain' }} // 'contain' para ver la imagen completa, 'cover' para llenar
                                className="bg-gray-100" // Fondo mientras carga o si la imagen no cubre
                                priority // Considera 'true' ya que es la imagen principal de la página
                            />
                        </div>

                        <div className="p-6 md:p-8 flex flex-col">
                            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">{product.name}</h1>
                            <p className="text-gray-600 mb-4 text-md leading-relaxed">{product.short_description}</p>
                            
                            <div className="my-4 py-4 border-t border-b border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-800 mb-2">Descripción</h2>
                                <p className="text-gray-700 whitespace-pre-line text-sm leading-relaxed">{product.full_description}</p>
                            </div>

                            <div className="text-sm text-gray-500 mb-1">
                                <span className="font-semibold text-gray-700">Categoría:</span> {product.category}
                            </div>
                            <div className="text-sm text-gray-500 mb-4">
                                <span className="font-semibold text-gray-700">Unidades disponibles:</span> 
                                {product.units > 0 ? ` ${product.units}` : <span className="text-red-500 font-semibold"> Agotado</span>}
                            </div>
                            
                            <div className="mt-auto"> {/* Empuja el precio y botón hacia abajo */}
                                <p className="text-3xl font-bold text-indigo-600 mb-6">
                                    ${product.price.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                                <button
                                    onClick={() => handleAddToCartProductPage(product)}
                                    disabled={product.units <= 0}
                                    className={`w-full py-3 px-6 text-white font-semibold rounded-md transition-colors duration-150 ease-in-out
                                                ${product.units > 0 
                                                    ? 'bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300' 
                                                    : 'bg-gray-400 cursor-not-allowed'
                                                }`}
                                >
                                    {product.units > 0 ? 'Añadir al carrito' : 'Producto Agotado'}
                                </button>
                            </div>
                        </div>
                    </div>
                </article>
            </div>
        </>
    );
}