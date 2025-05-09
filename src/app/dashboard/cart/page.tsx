// app/cart/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ConfirmationModal from '@/app/components/ConfirmationModal';

interface CartItem {
    _id: string;
    name: string;
    price: number;
    img: string;
    units: number;
    quantity: number;
}

export default function CartPage() {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const router = useRouter();

    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [confirmedOrderItems, setConfirmedOrderItems] = useState<CartItem[]>([]);
    const [confirmedTotalPrice, setConfirmedTotalPrice] = useState(0);

    useEffect(() => {
        console.log("CartPage: Intentando cargar carrito desde localStorage.");
        const storedCart = localStorage.getItem('cart');
        console.log("CartPage: Contenido de 'cart' en localStorage al cargar:", storedCart);

        if (storedCart) {
            try {
                const parsedCart = JSON.parse(storedCart);
                console.log("CartPage: Carrito parseado al cargar:", parsedCart);
                if (Array.isArray(parsedCart)) {
                    setCartItems(parsedCart);
                } else {
                    console.warn("CartPage: El carrito parseado no era un array. Se ignorará.");
                    setCartItems([]);
                }
            } catch (error) {
                console.error("CartPage: Error al parsear el carrito desde localStorage:", error);
                setCartItems([]);
            }
        } else {
            console.log("CartPage: No se encontró carrito en localStorage.");
            setCartItems([]);
        }
    }, []);

    useEffect(() => {
        console.log("CartPage: cartItems cambió, recalculando precio total. Items:", cartItems);
        const newTotalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        setTotalPrice(newTotalPrice);
    }, [cartItems]);

    const updateCartAndStorage = (newCart: CartItem[]) => {
        setCartItems(newCart);
        console.log("CartPage: Actualizando localStorage con:", newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
    };

    const removeFromCart = useCallback((itemId: string) => {
        const updatedCart = cartItems.filter(item => item._id !== itemId);
        updateCartAndStorage(updatedCart);
        toast.info("Producto eliminado del carrito.");
    }, [cartItems]);

    const increaseQuantity = useCallback((itemId: string) => {
        const updatedCart = cartItems.map(item =>
            item._id === itemId && item.quantity < item.units
                ? { ...item, quantity: item.quantity + 1 }
                : item
        );
        updateCartAndStorage(updatedCart);
    }, [cartItems]);

    const decreaseQuantity = useCallback((itemId: string) => {
        const updatedCart = cartItems.map(item => {
            if (item._id === itemId && item.quantity > 1) {
                return { ...item, quantity: item.quantity - 1 };
            }
            return item;
        });
        updateCartAndStorage(updatedCart);
    }, [cartItems]);

    const handleCheckout = useCallback(async () => {
        if (cartItems.length === 0) {
            toast.warn('El carrito está vacío.');
            return;
        }
        const orderDetails = cartItems.map(item => ({
            productId: item._id,
            quantity: item.quantity,
        }));

        try {
            const response = await fetch('/api/purchase', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderDetails }),
            });

            if (response.ok) {
                setConfirmedOrderItems([...cartItems]);
                setConfirmedTotalPrice(totalPrice);
                setShowConfirmationModal(true);
                
                // Limpiar el estado y localStorage explícitamente después de confirmar la orden
                setCartItems([]); 
                localStorage.removeItem('cart'); 
                console.log("CartPage: Carrito vaciado y localStorage limpiado después de la compra.");
            } else {
                const errorData = await response.json();
                toast.error(`Error al realizar la compra: ${errorData.error || 'Inténtalo de nuevo.'}`);
            }
        } catch (error) {
            console.error('Error al realizar la compra:', error);
            toast.error('Ocurrió un error al procesar tu pedido.');
        }
    }, [cartItems, totalPrice, router]);

    if (showConfirmationModal) {
        return (
            <ConfirmationModal
                isOpen={showConfirmationModal}
                orderItems={confirmedOrderItems}
                totalPrice={confirmedTotalPrice}
                onRedirect={() => {
                    setShowConfirmationModal(false);
                    router.push('/');
                }}
            />
        );
    }
    
    if (cartItems.length === 0 && !showConfirmationModal) {
        return (
            <div className="container mx-auto mt-10 px-4">
                <ToastContainer newestOnTop autoClose={3000} />
                <h1 className="text-2xl font-bold mb-4 text-center sm:text-left">Carrito de Compras</h1>
                <p className="text-gray-600 text-center sm:text-left">Tu carrito está vacío.</p>
                <div className="text-center sm:text-left mt-4">
                    <button 
                        onClick={() => router.push('/')} 
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Volver a la tienda
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto mt-10 px-4">
            <ToastContainer newestOnTop autoClose={3000} />
            <h1 className="text-2xl font-bold mb-6 text-center sm:text-left">Carrito de Compras</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {cartItems.map(item => (
                    <div key={item._id} className="bg-white rounded-lg shadow-md p-4 flex flex-col">
                        <div className="aspect-w-1 aspect-h-1 w-full relative mb-2 h-48 sm:h-56 bg-gray-200 rounded overflow-hidden">
                            <img
                                src={item.img}
                                alt={item.name}
                                className="object-cover w-full h-full"
                            />
                        </div>
                        <h3 className="text-lg font-semibold mb-1 text-gray-800">{item.name}</h3>
                        <p className="text-gray-600 mb-1">Precio: ${item.price.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        <div className="flex items-center space-x-2 my-2">
                            <label className="text-sm font-medium text-gray-700">Cantidad:</label>
                            <button
                                onClick={() => decreaseQuantity(item._id)}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-1 px-2 rounded-full focus:outline-none focus:shadow-outline disabled:opacity-50"
                                disabled={item.quantity <= 1}
                            >
                                -
                            </button>
                            <span className="text-lg w-8 text-center">{item.quantity}</span>
                            <button
                                onClick={() => increaseQuantity(item._id)}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-1 px-2 rounded-full focus:outline-none focus:shadow-outline disabled:opacity-50"
                                disabled={item.quantity >= item.units}
                            >
                                +
                            </button>
                            <span className="text-xs text-gray-500">({item.units} disp.)</span>
                        </div>
                        <button
                            onClick={() => removeFromCart(item._id)}
                            className="mt-auto px-4 py-2 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        >
                            Eliminar
                        </button>
                    </div>
                ))}
            </div>
            <div className="mt-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-0">Total: ${totalPrice.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
                <button
                    onClick={handleCheckout}
                    className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors w-full sm:w-auto"
                >
                    Comprar
                </button>
            </div>
        </div>
    );
}