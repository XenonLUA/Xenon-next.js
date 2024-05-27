import { sql } from "@vercel/postgres";
import { QueryResultRow } from "@vercel/postgres";

interface ValidKeyRow extends QueryResultRow {
  id: string;
  key: string;
  expiry: string; // Use string for timestamps to simplify
  created_at: string | null;
}

export default async function ValidKeysPage(): Promise<JSX.Element> {
  // Ensure the `valid_keys` table exists
  await sql`
    CREATE TABLE IF NOT EXISTS public.valid_keys (
      id UUID NOT NULL DEFAULT uuid_generate_v4(),
      key TEXT NOT NULL,
      expiry TIMESTAMP WITH TIME ZONE NOT NULL,
      created_at TIMESTAMP WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT valid_keys_pkey PRIMARY KEY (id)
    ) TABLESPACE pg_default;
  `;

  // Fetch data from the `valid_keys` table
  const result = await sql`SELECT * FROM public.valid_keys`;
  const rows = result.rows as ValidKeyRow[];

  return (
    <div>
      {rows.map((row: ValidKeyRow) => (
        <div key={row.id}>
          <p>ID: {row.id}</p>
          <p>Key: {row.key}</p>
          <p>Expiry: {new Date(row.expiry).toLocaleString()}</p>
          <p>
            Created At:{" "}
            {row.created_at ? new Date(row.created_at).toLocaleString() : "N/A"}
          </p>
        </div>
      ))}
    </div>
  );
}
