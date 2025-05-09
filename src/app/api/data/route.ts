import { NextResponse, NextRequest } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '6');
    const category = searchParams.get('category');
    const sortBy = searchParams.get('sortBy');
    const skip = (page - 1) * limit;
    const query: any = {};
    const sort: any = {};

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
    }

    try {
        const client = await clientPromise;
        const db = client.db('tienda');
        const productos = await db.collection('productos')
            .find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .toArray();
        const totalProductos = await db.collection('productos').countDocuments(query);
        const productosConIdString = productos.map(producto => ({
            ...producto,
            _id: producto._id.toString(),
        }));
        return NextResponse.json({ productos: productosConIdString, total: totalProductos });
    } catch (error) {
        return NextResponse.json(
            { error: "Error al obtener productos" },
            { status: 500 }
        );
    }
}