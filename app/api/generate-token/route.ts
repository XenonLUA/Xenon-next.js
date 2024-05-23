import { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import { supabase } from "@/lib/utils"; // Adjust the import path as needed

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	const token = crypto.randomBytes(16).toString("hex");

	try {
		const { data, error } = await supabase.from("tokens").insert([{ token, status: "pending" }]);

		if (error) {
			console.error("Supabase insert error:", error);
			return res.status(500).json({ success: false, message: "Failed to generate token" });
		}

		return res.status(200).json({ token });
	} catch (error) {
		console.error("Error generating token:", error);
		return res.status(500).json({ success: false, message: "Internal Server Error" });
	}
}
