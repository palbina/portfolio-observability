
import { type NextRequest, NextResponse } from "next/server";
import { fetchGitHubStats } from "@/lib/github/client";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const username = searchParams.get("username") || "palbina"; // Default to existing user if not provided

    try {
        const stats = await fetchGitHubStats(username);
        return NextResponse.json(stats);
    } catch (error) {
        console.error("Error fetching GitHub stats:", error);
        return NextResponse.json({ error: "Failed to fetch GitHub stats" }, { status: 500 });
    }
}
