'use client';

import React, { useEffect } from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

interface CartItem {
    _id: string;
    name: string;
    price: number;
    img: string; // Aunque no se use directamente en el resumen del modal, es parte del tipo
    units: number; // Igual que img
    quantity: number;
}

interface ConfirmationModalProps {
    isOpen: boolean;
    orderItems: CartItem[];
    totalPrice: number;
    onRedirect: () => void; // Función para ejecutar la redirección
    displayDuration?: number; // Duración en milisegundos que se muestra el modal
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    orderItems,
    totalPrice,
    onRedirect,
    displayDuration = 7000, // Por defecto, 7 segundos antes de redirigir
}) => {
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                onRedirect();
            }, displayDuration);
            return () => clearTimeout(timer); // Limpia el temporizador si el componente se desmonta
        }
    }, [isOpen, onRedirect, displayDuration]);

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out">
            <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-lg transform transition-all duration-300 ease-in-out scale-100">
                <h2 className="text-2xl sm:text-3xl font-bold text-center text-green-600 mb-6">
                    ¡Compra Realizada Exitosamente!
                </h2>

                <div className="mb-6 border-t border-b border-gray-200 py-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Resumen del Pedido:</h3>
                    <div className="max-h-60 overflow-y-auto space-y-3 pr-2">
                        {orderItems.map((item) => (
                            <div key={item._id} className="flex justify-between items-start pb-3 border-b border-gray-100 last:border-b-0">
                                <div className="flex-grow">
                                    <p className="text-gray-900 font-medium">{item.name}</p>
                                    <p className="text-sm text-gray-500">
                                        {item.quantity} unidad{item.quantity > 1 ? 'es' : ''} x ${item.price.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} c/u
                                    </p>
                                </div>
                                <p className="text-gray-900 font-semibold ml-4 whitespace-nowrap">
                                    ${(item.price * item.quantity).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-between items-center text-xl font-bold text-gray-900 py-4 mb-6">
                    <span>Total del Pedido:</span>
                    <span>${totalPrice.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>

                <div className="flex flex-col items-center text-center mb-6">
                    <CheckCircleIcon className="w-20 h-20 text-green-500 mb-3" />
                    {/* La "flecha enmarcada en verde" se interpreta como un icono de éxito */}
                </div>

                <p className="text-sm text-gray-600 text-center px-2">
                    Se ha enviado un correo electrónico a la dirección proporcionada por su usuario, ahí se le dará más información para seguir su compra, ¡gracias!
                </p>
            </div>
        </div>
    );
};

export default ConfirmationModal;