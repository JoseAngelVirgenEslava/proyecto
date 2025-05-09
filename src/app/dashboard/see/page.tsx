'use client';

import React, { useState, useCallback } from 'react';
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

export default function SeeProductPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [foundProduct, setFoundProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
        setFoundProduct(null); // Limpiar el producto anterior al escribir
        setError(null);
    };

    const handleSearch = useCallback(async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setFoundProduct(null);
        setError(null);

        try {
            const res = await fetch(`/api/search?name=${searchTerm}`);
            if (!res.ok) {
                const errorData = await res.json();
                setError(errorData.error || `Error al buscar el producto (Status: ${res.status})`);
                return;
            }
            const data = await res.json();
            if (data.product) {
                setFoundProduct(data.product);
            } else {
                setError(`No se encontró ningún producto con el nombre "${searchTerm}"`);
            }
        } catch (error) {
            console.error("Error al buscar el producto:", error);
            setError('Ocurrió un error al buscar el producto.');
        } finally {
            setLoading(false);
        }
    }, [searchTerm]);

    return (
        <div className="bg-gray-100 min-h-screen py-6 flex flex-col justify-center sm:py-12">
            <div className="relative py-3 sm:max-w-xl sm:mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
                <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
                    <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Buscar Producto</h1>
                    <form onSubmit={handleSearch} className="flex items-center mb-4">
                        <input
                            type="text"
                            placeholder="Ingresar nombre del producto"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={searchTerm}
                            onChange={handleInputChange}
                        />
                        <button
                            type="submit"
                            className="ml-3 bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            disabled={loading}
                        >
                            {loading ? 'Buscando...' : 'Buscar'}
                        </button>
                    </form>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                            <strong className="font-bold">Error:</strong>
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}

                    {foundProduct && (
                        <div className="mt-8">
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">Producto Encontrado:</h2>
                            <Element product={foundProduct} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}