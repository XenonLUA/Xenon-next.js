import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient"; // Adjust the import path as needed

export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url);
	const token = searchParams.get("token");

	if (!token) {
		return NextResponse.json({ success: false, message: "No token provided" }, { status: 400 });
	}

	try {
		// Verify the token with Linkvertise (mocked for example)
		const verificationResponse = await fetch(`https://linkvertise-api-endpoint/verify?token=${token}`);
		const verificationData = await verificationResponse.json();

		if (verificationData.success) {
			// Token is valid, insert into Supabase
			const { data, error } = await supabase.from("tokens").insert([{ token, status: "used" }]);

			if (error) {
				console.error("Supabase insert error:", error);
				return NextResponse.json({ success: false, message: "Failed to save the token" }, { status: 500 });
			}

			return NextResponse.json({ success: true });
		} else {
			return NextResponse.json({ success: false, message: "Invalid token" }, { status: 400 });
		}
	} catch (error) {
		console.error("Error verifying token:", error);
		return NextResponse.json({ success: false, message: "Error verifying token" }, { status: 500 });
	}
}
