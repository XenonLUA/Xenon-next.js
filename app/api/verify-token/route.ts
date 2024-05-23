import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/utils"; // Adjust the import path as needed

export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url);
	const token = searchParams.get("token");

	if (!token) {
		return NextResponse.json({ success: false, message: "No token provided" }, { status: 400 });
	}

	try {
		const { data: tokenData, error } = await supabase
			.from("tokens")
			.select("token, status")
			.eq("token", token)
			.single();

		if (error || !tokenData) {
			console.error("Supabase fetch error:", error);
			return NextResponse.json({ success: false, message: "Token not found" }, { status: 404 });
		}

		if (tokenData.status !== "pending") {
			return NextResponse.json({ success: false, message: "Token already used or invalid" }, { status: 400 });
		}

		// Verify the token with Linkvertise (mocked for example)
		const verificationResponse = await fetch(`https://linkvertise-api-endpoint/verify?token=${token}`);
		const verificationData = await verificationResponse.json();

		if (verificationData.success) {
			return NextResponse.json({ success: true });
		} else {
			return NextResponse.json({ success: false, message: "Invalid token" }, { status: 400 });
		}
	} catch (error) {
		console.error("Error verifying token:", error);
		return NextResponse.json({ success: false, message: "Error verifying token" }, { status: 500 });
	}
}
