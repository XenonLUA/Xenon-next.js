import { sql } from "@vercel/postgres";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const connectionString = process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error("Missing connection string for PostgreSQL database.");
}

// Ensure the connection string is set globally
process.env.DATABASE_URL = connectionString;

interface CartRow {
  id: string;
  quantity: number;
}

export default async function Cart({
  params,
}: {
  params: { user: string };
}): Promise<JSX.Element> {
  const result = await sql`SELECT * FROM CARTS WHERE user_id=${params.user}`;
  const rows = result.rows as CartRow[];

  return (
    <div>
      {rows.map((row: CartRow) => (
        <div key={row.id}>
          {row.id} - {row.quantity}
        </div>
      ))}
    </div>
  );
}
