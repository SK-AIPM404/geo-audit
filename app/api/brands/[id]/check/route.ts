import { prisma } from '@/lib/prisma';
import { checkCitations } from '@/lib/services/citation-checker';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const { query: queryText, categoryId } = body;

    if (!queryText) {
      return Response.json({ error: 'Query text is required' }, { status: 400 });
    }

    // Get the brand
    const brand = await prisma.brand.findUnique({
      where: { id },
    });

    if (!brand) {
      return Response.json({ error: 'Brand not found' }, { status: 404 });
    }

    // Create or find the query record
    let query = await prisma.query.findFirst({
      where: {
        brandId: id,
        text: queryText,
      },
    });

    if (!query) {
      // Need a category - create a default one if not provided
      let catId = categoryId;
      if (!catId) {
        const defaultCategory = await prisma.category.findFirst({
          where: { brandId: id },
        });
        if (defaultCategory) {
          catId = defaultCategory.id;
        } else {
          const newCategory = await prisma.category.create({
            data: {
              name: 'General',
              brandId: id,
            },
          });
          catId = newCategory.id;
        }
      }

      query = await prisma.query.create({
        data: {
          text: queryText,
          brandId: id,
          categoryId: catId,
          status: 'running',
        },
      });
    } else {
      // Update status to running
      await prisma.query.update({
        where: { id: query.id },
        data: { status: 'running' },
      });
    }

    // Run citation check
    const results = await checkCitations(brand.name, queryText);

    // Save citations to database
    const savedCitations = [];
    for (const result of results) {
      const citation = await prisma.citation.create({
        data: {
          queryId: query.id,
          brandId: id,
          aiEngine: result.aiEngine,
          response: result.response,
          brandMentioned: result.brandMentioned,
          brandPosition: result.brandPosition,
          competitors: JSON.stringify(result.competitors),
        },
      });
      savedCitations.push(citation);

      // Update competitor mention counts
      for (const competitorName of result.competitors) {
        await prisma.competitor.upsert({
          where: { name: competitorName },
          create: { name: competitorName, mentionCount: 1 },
          update: { mentionCount: { increment: 1 } },
        });
      }
    }

    // Update query status
    await prisma.query.update({
      where: { id: query.id },
      data: { status: 'completed' },
    });

    return Response.json({
      query,
      citations: savedCitations,
      results,
    });
  } catch (error) {
    console.error('Failed to check citations:', error);
    return Response.json({ error: 'Failed to check citations' }, { status: 500 });
  }
}
