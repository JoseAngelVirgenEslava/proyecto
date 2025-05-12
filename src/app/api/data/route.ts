import { NextResponse, NextRequest } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Collection, Filter, Sort, ObjectId} from 'mongodb';

interface ProductDocument {
  _id: ObjectId;
  name: string;
  price: number;
  category: string;
  units: number;
}

export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;

    let page = parseInt(searchParams.get('page') || '1', 10);
    let limit = parseInt(searchParams.get('limit') || '6', 10);

    if (isNaN(page) || page < 1) {
        console.warn(`API /api/data: 'page' inválido (${searchParams.get('page')}), usando 1 por defecto.`);
        page = 1;
    }
    if (isNaN(limit) || limit < 1) {
        console.warn(`API /api/data: 'limit' inválido (${searchParams.get('limit')}), usando 6 por defecto.`);
        limit = 6;
    }
    
    const category = searchParams.get('category');
    const sortBy = searchParams.get('sortBy');
    const skip = (page - 1) * limit;

    // Construcción de la consulta y opciones de ordenamiento
    const query: Filter<ProductDocument> = {};
    const sort: Sort = {};

    if (category && category !== 'all') {
        query.category = category;
    }

    if (sortBy === 'price-asc') {
        sort.price = 1;
    } else if (sortBy === 'price-desc') {
        sort.price = -1;
    } else if (sortBy === 'units-asc') {
        sort.units = 1;
    } else if (sortBy === 'units-desc') {
        sort.units = -1;
    } else {
        // Ordenamiento por defecto si no se especifica sortBy, para paginación consistente
        sort._id = 1;
    }

    console.log(`API /api/data: Executing query - Page: ${page}, Limit: ${limit}, Skip: ${skip}, Query: ${JSON.stringify(query)}, Sort: ${JSON.stringify(sort)}`);

    try {
        const client = await clientPromise;
        const db = client.db('tienda');
        const productosCollection: Collection<ProductDocument> = db.collection('productos');
        const productos: ProductDocument[] = await productosCollection
            .find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .toArray();
        const totalProductos = await productosCollection.countDocuments(query);

        console.log(`API /api/data: Found ${productos.length} productos for page ${page}. Total matching query: ${totalProductos}.`);

        const productosConIdString = productos.map(producto => ({
            ...producto,
            _id: producto._id.toString(),
        }));

        return NextResponse.json({ 
            productos: productosConIdString, 
            total: totalProductos,
            currentPage: page,
            limit: limit
        });

    } catch (error: any) {
        console.error("API /api/data: Error al obtener productos:", error);
        return NextResponse.json(
            { message: "Error interno del servidor al obtener productos.", details: error.message },
            { status: 500 }
        );
    }
}