// /app/api/generate-token/route.ts
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function GET(req: NextRequest) {
	const token = uuidv4();
	return NextResponse.json({ token });
}
