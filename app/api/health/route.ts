
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        return Response.json({ status: 'healthy', timestamp: new Date().toISOString() }, { status: 200 });
    } catch (error) {
        return Response.json({ status: 'unhealthy' }, { status: 503 });
    }
}
