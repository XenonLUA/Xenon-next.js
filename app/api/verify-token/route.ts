// /pages/api/verify-token/route.ts

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/utils"; // Sesuaikan jalur impor jika perlu

export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url);
	const token = searchParams.get("token");

	if (!token) {
		return NextResponse.json({ success: false, message: "No token provided" }, { status: 400 });
	}

	try {
		console.log(`Verifying token: ${token}`);

		// Ambil token dari Supabase
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
			console.log(`Token ${token} already used or invalid with status ${tokenData.status}`);
			return NextResponse.json({ success: false, message: "Token already used or invalid" }, { status: 400 });
		}

		// Update status token di Supabase
		const { error: updateError } = await supabase
			.from("tokens")
			.update({ status: "completed" })
			.eq("token", token);

		if (updateError) {
			console.error("Supabase update error:", updateError);
			return NextResponse.json({ success: false, message: "Error updating token status" }, { status: 500 });
		}

		console.log(`Token ${token} verified successfully`);
		return NextResponse.json({ success: true });

	} catch (error) {
		console.error("Error verifying token:", error);
		return NextResponse.json({ success: false, message: "Error verifying token" }, { status: 500 });
	}
}
