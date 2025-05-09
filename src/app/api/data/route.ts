import { NextResponse, NextRequest } from 'next/server';
import clientPromise from '@/lib/mongodb'; // Asegúrate que la ruta a tu config de MongoDB sea correcta
import { Collection, Filter, Sort, ObjectId} from 'mongodb'; // Tipos de MongoDB

interface ProductDocument {
  _id: ObjectId; // ObjectId, pero puede ser string después de la conversión
  name: string;
  price: number;
  category: string;
  units: number;
  // ...otros campos de tu producto
}

export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;

    // Parseo y validación de page y limit
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
        sort._id = 1; // o -1 si prefieres los más nuevos primero por ID de inserción
    }

    console.log(`API /api/data: Executing query - Page: ${page}, Limit: ${limit}, Skip: ${skip}, Query: ${JSON.stringify(query)}, Sort: ${JSON.stringify(sort)}`);

    try {
        const client = await clientPromise;
        const db = client.db('tienda'); // Reemplaza 'tienda' con el nombre de tu BD si es diferente
        const productosCollection: Collection<ProductDocument> = db.collection('productos'); // Reemplaza 'productos' si tu colección es diferente
        const productos: ProductDocument[] = await productosCollection
            .find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .toArray();

        // Contar el total de documentos que coinciden con la query (sin paginación)
        // Esto es útil para la UI si quieres mostrar "Página X de Y" o "Mostrando A-B de C resultados"
        // No es estrictamente necesario para la lógica de 'hasMore' del frontend si se basa en la longitud de 'productos' devueltos.
        const totalProductos = await productosCollection.countDocuments(query);

        console.log(`API /api/data: Found ${productos.length} productos for page ${page}. Total matching query: ${totalProductos}.`);

        // Mapear para convertir _id a string (importante para la serialización JSON y uso en el frontend)
        const productosConIdString = productos.map(producto => ({
            ...producto,
            _id: producto._id.toString(),
        }));

        return NextResponse.json({ 
            productos: productosConIdString, 
            total: totalProductos,
            currentPage: page,
            limit: limit,
            // Puedes añadir hasMore aquí si lo calculas basado en totalProductos y la página actual
            // hasMore: skip + productos.length < totalProductos 
        });

    } catch (error: any) {
        console.error("API /api/data: Error al obtener productos:", error);
        return NextResponse.json(
            { message: "Error interno del servidor al obtener productos.", details: error.message },
            { status: 500 }
        );
    }
}