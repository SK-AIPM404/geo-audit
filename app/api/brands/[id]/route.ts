import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const brand = await prisma.brand.findUnique({
      where: { id },
      include: {
        categories: true,
        queries: {
          include: {
            citations: true,
            category: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        citations: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });

    if (!brand) {
      return Response.json({ error: 'Brand not found' }, { status: 404 });
    }

    return Response.json(brand);
  } catch (error) {
    console.error('Failed to fetch brand:', error);
    return Response.json({ error: 'Failed to fetch brand' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    await prisma.brand.delete({
      where: { id },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Failed to delete brand:', error);
    return Response.json({ error: 'Failed to delete brand' }, { status: 500 });
  }
}
