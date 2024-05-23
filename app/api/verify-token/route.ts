import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/utils"; // Adjust the import path as needed

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	const { token } = req.query;

	if (!token) {
		return res.status(400).json({ success: false, message: "No token provided" });
	}

	try {
		const { data, error } = await supabase
			.from("tokens")
			.select("token, status")
			.eq("token", token)
			.single();

		if (error || !data) {
			console.error("Supabase fetch error:", error);
			return res.status(404).json({ success: false, message: "Token not found" });
		}

		if (data.status !== "pending") {
			return res.status(400).json({ success: false, message: "Token already used or invalid" });
		}

		// Mock verification response from Linkvertise
		const verificationResponse = { success: true };

		if (verificationResponse.success) {
			const { error: updateError } = await supabase
				.from("tokens")
				.update({ status: "completed" })
				.eq("token", token);

			if (updateError) {
				console.error("Supabase update error:", updateError);
				return res.status(500).json({ success: false, message: "Failed to update token status" });
			}

			return res.status(200).json({ success: true });
		} else {
			return res.status(400).json({ success: false, message: "Invalid token" });
		}
	} catch (error) {
		console.error("Error verifying token:", error);
		return res.status(500).json({ success: false, message: "Error verifying token" });
	}
}
