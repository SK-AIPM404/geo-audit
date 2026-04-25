import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            citations: true,
            queries: true,
          },
        },
      },
    });
    return Response.json(brands);
  } catch (error) {
    console.error('Failed to fetch brands:', error);
    return Response.json({ error: 'Failed to fetch brands' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, website, description } = body;

    if (!name || !website) {
      return Response.json({ error: 'Name and website are required' }, { status: 400 });
    }

    const brand = await prisma.brand.create({
      data: {
        name,
        website,
        description: description || null,
      },
    });

    return Response.json(brand, { status: 201 });
  } catch (error) {
    console.error('Failed to create brand:', error);
    return Response.json({ error: 'Failed to create brand' }, { status: 500 });
  }
}
