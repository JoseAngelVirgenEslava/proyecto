'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Element } from '@/app/components/Element';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// ... (tus interfaces Product, CartItem, FilterOptions y el resto del componente MainPage se mantienen igual) ...
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
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const observer = useRef<IntersectionObserver | null>(null);
    const [filterOptions, setFilterOptions] = useState<FilterOptions>({ category: 'all', sortBy: '' });
    const [categories, setCategories] = useState<string[]>([]);
    const initialFetchDone = useRef(false);

    // Log para cada render y el estado actual
    useEffect(() => {
        console.log(
            `MainPage RENDER: page=${page}, loading=${loading}, hasMore=${hasMore}, products.length=${products.length}, filterOptions=${JSON.stringify(filterOptions)}, initialFetchDone=${initialFetchDone.current}`
        );
    }, [page, loading, hasMore, products, filterOptions]);


    const fetchProducts = useCallback(async (currentPage: number, currentFilterOptions: FilterOptions) => {
        console.log(`MainPage: fetchProducts CALLED for page ${currentPage}, filters: ${JSON.stringify(currentFilterOptions)}`);
        setLoading(true);

        try {
            const categoryParam = currentFilterOptions.category === 'all' ? '' : `&category=${encodeURIComponent(currentFilterOptions.category)}`;
            const sortByParam = currentFilterOptions.sortBy ? `&sortBy=${encodeURIComponent(currentFilterOptions.sortBy)}` : '';
            const res = await fetch(`/api/data?page=${currentPage}&limit=6${categoryParam}${sortByParam}`);
            
            if (!res.ok) {
                console.error(`MainPage: API Error fetching products (${res.status}) for page ${currentPage}`);
                toast.error(`Error ${res.status} al cargar productos.`);
                setHasMore(false);
                if (currentPage === 1) setProducts([]);
                return; 
            }
            const data = await res.json(); 
            console.log(`MainPage: fetchProducts RESPONSE for page ${currentPage}. Received ${data.productos?.length || 0} products. API response:`, data);

            if (data.productos && Array.isArray(data.productos)) {
                if (data.productos.length === 0) { 
                    if (currentPage === 1) {
                        setProducts([]);
                    }
                    setHasMore(false);
                    console.log(`MainPage: fetchProducts - No products from API (length 0), setHasMore(false) for page ${currentPage}`);
                } else { 
                    setProducts((prevProducts) => {
                        let newUniqueProducts: Product[];

                        if (currentPage === 1) {
                            newUniqueProducts = data.productos; 
                        } else {
                            const existingProductIds = new Set(prevProducts.map(p => p._id));
                            newUniqueProducts = data.productos.filter((newProd: Product) => {
                                if (existingProductIds.has(newProd._id)) {
                                    console.warn(`MainPage: Producto duplicado encontrado y SKIPPED: ID=${newProd._id}, Name=${newProd.name}`);
                                    return false; 
                                }
                                return true; 
                            });
                        }
                        
                        if (data.productos.length < 6) {
                            setHasMore(false);
                            console.log(`MainPage: setProducts - API devolvió ${data.productos.length} (<6) productos. setHasMore(false).`);
                        } else { 
                            if (currentPage > 1 && newUniqueProducts.length === 0) {
                                setHasMore(false);
                                console.warn(`MainPage: setProducts - Página ${currentPage} devolvió 6 productos, pero todos eran duplicados. setHasMore(false).`);
                            } else {
                                setHasMore(true);
                                console.log(`MainPage: setProducts - API devolvió 6 productos, y se añadieron/consideraron ${newUniqueProducts.length} únicos. setHasMore(true).`);
                            }
                        }
                        
                        if (currentPage > 1 && newUniqueProducts.length === 0) {
                            return prevProducts;
                        }
                        const finalProductsArray = currentPage === 1 ? newUniqueProducts : [...prevProducts, ...newUniqueProducts];
                        console.log(`MainPage: fetchProducts - setProducts for page ${currentPage}. Adding ${newUniqueProducts.length} new, unique products. Total length: ${finalProductsArray.length}`);
                        return finalProductsArray;
                    });
                }
            } else { 
                 console.warn(`MainPage: fetchProducts - Unexpected data format or no data.productos from API for page ${currentPage}`, data);
                 if (currentPage === 1) setProducts([]);
                 setHasMore(false);
            }
        } catch (error) {
            console.error("MainPage: fetchProducts CATCH error:", error);
            toast.error("Error crítico al cargar productos.");
            setHasMore(false);
            if (currentPage === 1) setProducts([]);
        } finally {
            console.log(`MainPage: fetchProducts FINALLY for page ${currentPage}, setLoading(false)`);
            setLoading(false);
            if (currentPage === 1) {
                initialFetchDone.current = true;
                console.log(`MainPage: fetchProducts - initialFetchDone.current = true for page ${currentPage}`);
            }
        }
    }, []); 

    const fetchCategories = useCallback(async () => {
        console.log("MainPage: fetchCategories CALLED");
        try {
            const res = await fetch('/api/categories');
            if (!res.ok) {
                console.error(`MainPage: API Error fetching categories (${res.status})`);
                toast.error(`Error ${res.status} al cargar categorías.`);
                return;
            }
            const data = await res.json();
            if (data.categories && Array.isArray(data.categories)) {
                setCategories(['all', ...data.categories]);
            } else {
                console.warn("MainPage: fetchCategories - Unexpected data format", data);
            }
        } catch (error) {
            console.error("MainPage - Error fetching categories:", error);
            toast.error("Error al cargar categorías.");
        }
    }, []);

    useEffect(() => {
        console.log("MainPage: fetchCategories EFFECT RUNNING");
        fetchCategories();
    }, [fetchCategories]);

    useEffect(() => {
        console.log("MainPage: filterOptions EFFECT RUNNING. New filterOptions:", JSON.stringify(filterOptions), ". Resetting page to 1.");
        setProducts([]);
        setPage(1);
        setHasMore(false); 
        initialFetchDone.current = false; 
        console.log("MainPage: filterOptions EFFECT - page reset to 1, initialFetchDone reset to false.");
    }, [filterOptions]);

    useEffect(() => {
        console.log(
            `MainPage: EVALUATING Main Fetch EFFECT | page: ${page} | hasMore: ${hasMore} | loading: ${loading} | initialFetchDone: ${initialFetchDone.current}`
        );
        const isTimeToFetchInitial = (page === 1 && !initialFetchDone.current);
        const isTimeToFetchMore = (page > 1 && hasMore && !loading);

        if (isTimeToFetchInitial) {
            console.log(`MainPage: Main Fetch EFFECT - Triggering INITIAL fetch for page 1.`);
            fetchProducts(page, filterOptions);
        } else if (isTimeToFetchMore) {
            console.log(`MainPage: Main Fetch EFFECT - Triggering fetch for MORE items, page: ${page}.`);
            fetchProducts(page, filterOptions);
        } else {
            console.log(`MainPage: Main Fetch EFFECT - NO FETCH triggered. Conditions: isTimeToFetchInitial=${isTimeToFetchInitial}, isTimeToFetchMore=${isTimeToFetchMore}, loading=${loading}, hasMore=${hasMore}`);
        }
    }, [page, filterOptions, hasMore, loading, fetchProducts]);

    const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = event.target;
        setFilterOptions((prevOptions) => ({ ...prevOptions, [name]: value }));
    };

    const lastProductRef = useCallback((node: HTMLDivElement | null) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        
        observer.current = new IntersectionObserver((entries) => {
            if (entries[0]?.isIntersecting && hasMore && !loading) {
                console.log(`MainPage: IntersectionObserver CB - TRIGGERED & MET CONDITIONS. Incrementing page.`);
                setPage((prevPage) => prevPage + 1);
            }
        }, { threshold: 0.1 }); 

        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    const handleAddToCart = (product: Product) => {
        console.log("MainPage - Producto recibido para añadir:", product);
        if (!product || typeof product._id === 'undefined') {
            toast.error("No se puede añadir un producto inválido.");
            return;
        }
        if (product.units <= 0) {
            toast.warn(`${product.name} no tiene unidades disponibles.`);
            return;
        }
        let cart: CartItem[] = [];
        if (typeof window !== 'undefined') {
            const storedCart = localStorage.getItem('cart');
            if (storedCart) {
                try {
                    const parsed = JSON.parse(storedCart);
                    if (Array.isArray(parsed)) cart = parsed;
                } catch (e) { /* ignore */ }
            }
        }
        const existingItemIndex = cart.findIndex(item => item._id === product._id);
        if (existingItemIndex > -1) {
            if (cart[existingItemIndex].quantity < product.units) {
                cart[existingItemIndex].quantity += 1;
                toast.success(`${product.name} cantidad aumentada.`);
            } else {
                toast.info(`No puedes añadir más unidades de ${product.name}.`);
            }
        } else {
            cart.push({ ...product, quantity: 1 });
            toast.success(`${product.name} añadido al carrito!`);
        }
        if (typeof window !== 'undefined') {
            localStorage.setItem('cart', JSON.stringify(cart));
            console.log("MainPage - Carrito guardado en localStorage:", localStorage.getItem('cart'));
        }
    };

    // JSX
    if (loading && page === 1 && !initialFetchDone.current) {
        return <div className="text-center p-8 text-xl">Cargando productos iniciales...</div>;
    }

    return (
        <div className="bg-white">
            <ToastContainer newestOnTop autoClose={3000} hideProgressBar={false} />
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
                <div className="mb-8 flex flex-col sm:flex-row items-stretch sm:items-center sm:space-x-4 space-y-4 sm:space-y-0">
                    {/* Selectores de filtro */}
                    <div className="w-full sm:w-auto">
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700">Categoría:</label>
                        <select
                            id="category"
                            name="category"
                            className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm shadow-sm"
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
                            className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm shadow-sm"
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

                {/* Log de productos ANTES de mapear */}
                {(() => {
                    if (products.length > 0) {
                        console.log("MainPage - Productos en estado listos para mapear:", JSON.parse(JSON.stringify(products)));
                    } else if (initialFetchDone.current && !loading) {
                         console.log("MainPage - No hay productos en estado para mapear (y no se está cargando).");
                    }
                    return null; 
                })()}


                {(!loading && products.length === 0 && initialFetchDone.current) && (
                    <div className="text-center p-8 col-span-full text-gray-500">No se encontraron productos con los filtros seleccionados.</div>
                )}

                <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
                    {products.map((product) => {
                        // Log individual para cada producto que se va a pasar a Element
                        console.log("MainPage - Mapeando producto para Element:", product);
                        if (!product || typeof product._id !== 'string' || product._id === '') {
                            console.error("MainPage - Producto con ID inválido encontrado en el map:", product);
                            return <div key={Math.random()} className="text-red-500">Error: Producto con ID inválido.</div>; // Renderiza un error o null
                        }
                        return (
                            <Element
                                key={product._id}
                                product={product}
                                onAddToCart={handleAddToCart}
                                ref={(products.length > 0 && product._id === products[products.length - 1]._id) && hasMore && !loading ? lastProductRef : null}
                            />
                        );
                    })}
                </div>

                {(loading && (page > 1 || (page === 1 && !initialFetchDone.current))) && (
                    <div className="text-center p-4 col-span-full text-gray-700">Cargando más productos...</div>
                )}
                {(!hasMore && products.length > 0 && initialFetchDone.current && !loading) && (
                    <div className="text-center p-4 col-span-full text-gray-500">No hay más productos para mostrar.</div>
                )}
            </div>
        </div>
    );
}