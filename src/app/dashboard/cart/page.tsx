'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

    useEffect(() => {
        // Load cart items from local storage on component mount
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
            setCartItems(JSON.parse(storedCart));
        }
    }, []);

    useEffect(() => {
        // Update total price whenever cart items change
        const newTotalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        setTotalPrice(newTotalPrice);
        // Update local storage whenever cart items change
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const removeFromCart = useCallback((itemId: string) => {
        setCartItems(currentItems => currentItems.filter(item => item._id !== itemId));
    }, []);

    const increaseQuantity = useCallback((itemId: string) => {
        setCartItems(currentItems =>
            currentItems.map(item =>
                item._id === itemId && item.quantity < item.units
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            )
        );
    }, []);

    const decreaseQuantity = useCallback((itemId: string) => {
        setCartItems(currentItems =>
            currentItems.map(item =>
                item._id === itemId && item.quantity > 1
                    ? { ...item, quantity: item.quantity - 1 }
                    : item
            )
        );
    }, []);

    const handleCheckout = useCallback(async () => {
        if (cartItems.length === 0) {
            toast.warn('El carrito está vacío.', { position: 'top-right', autoClose: 3000 });
            return;
        }

        const orderDetails = cartItems.map(item => ({
            productId: item._id,
            quantity: item.quantity,
        }));

        try {
            const response = await fetch('/api/purchase', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ orderDetails }),
            });

            if (response.ok) {
                const data = await response.json();
                const totalUnitsOrdered = cartItems.reduce((sum, item) => sum + item.quantity, 0);
                toast.success(
                    `Compra realizada exitosamente: ${totalUnitsOrdered} unidades por $${totalPrice.toFixed(2)}`,
                    { position: 'top-center', autoClose: 5000 }
                );
                setCartItems([]); // Clear the cart
                localStorage.removeItem('cart'); // Clear local storage
                setTimeout(() => {
                    router.push('/');
                }, 5000);
            } else {
                const errorData = await response.json();
                toast.error(`Error al realizar la compra: ${errorData.error || 'Inténtalo de nuevo.'}`, {
                    position: 'top-right',
                    autoClose: 5000,
                });
            }
        } catch (error) {
            console.error('Error al realizar la compra:', error);
            toast.error('Ocurrió un error al procesar tu pedido. Inténtalo de nuevo.', {
                position: 'top-right',
                autoClose: 5000,
            });
        }
    }, [cartItems, totalPrice, router]);

    if (cartItems.length === 0) {
        return (
            <div className="container mx-auto mt-10">
                <h1 className="text-2xl font-bold mb-4">Carrito de Compras</h1>
                <p className="text-gray-600">Tu carrito está vacío.</p>
                <button onClick={() => router.push('/')} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                    Volver a la tienda
                </button>
                <ToastContainer />
            </div>
        );
    }

    return (
        <div className="container mx-auto mt-10">
            <h1 className="text-2xl font-bold mb-4">Carrito de Compras</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cartItems.map(item => (
                    <div key={item._id} className="bg-white rounded-lg shadow-md p-4 flex flex-col">
                        <div className="aspect-w-1 aspect-h-1 w-full relative mb-2">
                            <img
                                src={item.img}
                                alt={item.name}
                                className="object-cover rounded-md"
                            />
                        </div>
                        <h3 className="text-lg font-semibold mb-1">{item.name}</h3>
                        <p className="text-gray-600 mb-1">Precio: ${item.price.toFixed(2)}</p>
                        <div className="flex items-center space-x-2 mb-2">
                            <label className="text-sm font-medium text-gray-700">Cantidad:</label>
                            <button
                                onClick={() => decreaseQuantity(item._id)}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-1 px-2 rounded-full focus:outline-none focus:shadow-outline"
                                disabled={item.quantity <= 1}
                            >
                                -
                            </button>
                            <span className="text-lg">{item.quantity}</span>
                            <button
                                onClick={() => increaseQuantity(item._id)}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-1 px-2 rounded-full focus:outline-none focus:shadow-outline"
                                disabled={item.quantity >= item.units}
                            >
                                +
                            </button>
                            <span className="text-xs text-gray-500">({item.units} disponibles)</span>
                        </div>
                        <button
                            onClick={() => removeFromCart(item._id)}
                            className="mt-auto px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 text-sm"
                        >
                            Eliminar
                        </button>
                    </div>
                ))}
            </div>
            <div className="mt-6 flex justify-between items-center">
                <h2 className="text-xl font-semibold">Total: ${totalPrice.toFixed(2)}</h2>
                <button
                    onClick={handleCheckout}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                    Comprar
                </button>
            </div>
            <ToastContainer />
        </div>
    );
}