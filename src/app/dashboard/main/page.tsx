'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Element } from '@/app/components/Element'; // Asumo que la ruta es correcta
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

// Interfaz para los ítems del carrito (similar a la de CartPage)
interface CartItem extends Product {
    quantity: number;
}

interface FilterOptions {
    category: string | 'all';
    sortBy: 'price-asc' | 'price-desc' | 'units-asc' | 'units-desc' | '';
}

export default function MainPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1); // La página inicial es 1
    const [hasMore, setHasMore] = useState(false);
    const observer = useRef<IntersectionObserver | null>(null);
    const [filterOptions, setFilterOptions] = useState<FilterOptions>({ category: 'all', sortBy: '' });
    const [categories, setCategories] = useState<string[]>([]);
    const initialFetchDone = useRef(false); // Para controlar la carga inicial

    const fetchProducts = useCallback(async (currentPage: number, currentFilterOptions: FilterOptions) => {
        setLoading(true);
        try {
            const categoryParam = currentFilterOptions.category === 'all' ? '' : `&category=${currentFilterOptions.category}`;
            const sortByParam = currentFilterOptions.sortBy ? `&sortBy=${currentFilterOptions.sortBy}` : '';
            const res = await fetch(`/api/data?page=${currentPage}&limit=6${categoryParam}${sortByParam}`);
            const data = await res.json();

            if (data.productos && data.productos.length > 0) {
                setProducts((prevProducts) => {
                    // Si es la página 1 (después de un filtro o carga inicial), reemplaza los productos.
                    // De lo contrario, los añade.
                    return currentPage === 1 ? data.productos : [...prevProducts, ...data.productos];
                });
                setHasMore(data.productos.length === 6);
            } else {
                // Si es la página 1 y no hay productos, establece el array vacío.
                if (currentPage === 1) {
                    setProducts([]);
                }
                setHasMore(false);
            }
        } catch (error) {
            console.error("Error fetching products:", error);
            toast.error("Error al cargar productos.");
        } finally {
            setLoading(false);
            if (currentPage === 1) {
                initialFetchDone.current = true;
            }
        }
    }, []);

    const fetchCategories = useCallback(async () => {
        try {
            const res = await fetch('/api/categories');
            const data = await res.json();
            if (data.categories) {
                setCategories(['all', ...data.categories]);
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
            toast.error("Error al cargar categorías.");
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    // Efecto para cargar productos cuando cambian los filtros o en la carga inicial
    useEffect(() => {
        setProducts([]); // Limpia productos antes de una nueva búsqueda por filtro
        setPage(1);       // Resetea la página a 1
        setHasMore(false); // Resetea hasMore
        initialFetchDone.current = false; // Permite que la carga inicial se muestre
        // fetchProducts se llamará en el siguiente efecto debido al cambio de 'page' o 'filterOptions'
    }, [filterOptions]);


    // Efecto para cargar productos cuando la página cambia o en la carga inicial después del reseteo por filtro
    useEffect(() => {
        // Solo llama a fetchProducts si la página es 1 (para la carga inicial/filtrada)
        // o si hasMore es true (para scroll infinito)
        // Evita llamar a fetchProducts si page es 1 pero ya se hizo la carga inicial por filtro y no queremos recargar
        if (page === 1 || hasMore) {
             fetchProducts(page, filterOptions);
        }
    }, [page, filterOptions, fetchProducts, hasMore]);


    const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = event.target;
        setFilterOptions((prevOptions) => ({
            ...prevOptions,
            [name]: value,
        }));
        // El useEffect que depende de filterOptions se encargará de resetear y recargar.
    };

    const lastProductRef = useCallback((node: HTMLDivElement | null) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver((entries) => {
            if (entries.some(entry => entry.isIntersecting) && hasMore) {
                setPage((prevPage) => prevPage + 1); // Esto disparará el useEffect para cargar más productos
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);


    const handleAddToCart = (product: Product) => {
        const storedCart = localStorage.getItem('cart');
        let cart: CartItem[] = storedCart ? JSON.parse(storedCart) : [];
        const existingItemIndex = cart.findIndex(item => item._id === product._id);

        if (product.units <= 0) {
            toast.warn(`${product.name} no tiene unidades disponibles.`, { position: "top-right", autoClose: 3000 });
            return;
        }

        if (existingItemIndex > -1) {
            // Producto ya en el carrito
            if (cart[existingItemIndex].quantity < product.units) {
                cart[existingItemIndex].quantity += 1;
                toast.success(`${product.name} cantidad aumentada en el carrito.`, { position: "top-right", autoClose: 2000 });
            } else {
                toast.info(`No puedes añadir más unidades de ${product.name}. Máximo disponible alcanzado en el carrito.`, { position: "top-right", autoClose: 3000 });
                return;
            }
        } else {
            // Producto no en carrito, añadirlo
            cart.push({ ...product, quantity: 1 });
            toast.success(`${product.name} añadido al carrito!`, { position: "top-right", autoClose: 2000 });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        // Opcional: Actualizar un contador de carrito en la UI (requeriría estado global o pasar props)
    };

    // Muestra "Cargando productos..." solo en la carga inicial absoluta o cuando los filtros cambian y se resetea la página.
    if (loading && page === 1 && !initialFetchDone.current) {
        return <div className="text-center p-8">Cargando productos...</div>;
    }

    return (
        <div className="bg-white">
            <ToastContainer newestOnTop />
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
                <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center sm:space-x-4 space-y-4 sm:space-y-0">
                    <div className="w-full sm:w-auto">
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700">Categoría:</label>
                        <select
                            id="category"
                            name="category"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            value={filterOptions.category}
                            onChange={handleFilterChange}
                        >
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>{cat === 'all' ? 'Todas' : cat}</option>
                            ))}
                        </select>
                    </div>
                    <div className="w-full sm:w-auto">
                        <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700">Ordenar por:</label>
                        <select
                            id="sortBy"
                            name="sortBy"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            value={filterOptions.sortBy}
                            onChange={handleFilterChange}
                        >
                            <option value="">Ninguno</option>
                            <option value="price-asc">Precio (Menor a Mayor)</option>
                            <option value="price-desc">Precio (Mayor a Menor)</option>
                            <option value="units-asc">Unidades (Menos a más)</option>
                            <option value="units-desc">Unidades (Más a menos)</option>
                        </select>
                    </div>
                </div>

                <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-6">Productos disponibles</h2>

                {/* Mensaje si no hay productos y no está cargando */}
                {!loading && products.length === 0 && initialFetchDone.current && (
                    <div className="text-center p-8 col-span-full">No se encontraron productos con los filtros seleccionados.</div>
                )}

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
                    {products.map((product, index) => (
                        <Element
                            key={`${product._id}-${index}`} // Clave más robusta
                            product={product}
                            onAddToCart={handleAddToCart}
                            // Asigna la ref al último elemento visible para el scroll infinito
                            ref={(index === products.length - 1) && hasMore ? lastProductRef : null}
                        />
                    ))}
                </div>

                {/* Indicador de carga para scroll infinito */}
                {loading && page > 1 && (
                    <div className="text-center p-4 col-span-full">Cargando más productos...</div>
                )}

                {/* Mensaje cuando no hay más productos que cargar */}
                {!hasMore && products.length > 0 && initialFetchDone.current && page > 1 && (
                     <div className="text-center p-4 col-span-full text-gray-500">No hay más productos para mostrar.</div>
                )}
            </div>
        </div>
    );
}