import { vi } from "vitest";
import { db } from "./index";
import { user } from "./schema";
import { newDb } from "pg-mem";

vi.mock("./index", async () => {
	const { drizzle } = await import("drizzle-orm/node-postgres");
	const { migrate } = await import("drizzle-orm/node-postgres/migrator");
	const { newDb } = await import("pg-mem");

	const inMemoryDb = newDb().adapters.createPg().Client;
	const db = drizzle(inMemoryDb);

	await migrate(db, { migrationsFolder: "drizzle" }).catch((err) =>
		console.error(err)
	);

	return { db };
});

// this doesn't work
test("drizzle with pg-mem", async () => {
	await db.insert(user).values({ id: 1, name: "John" }).execute();

	const rows = await db.select().from(user).limit(1).execute();

	expect(rows[0]).toMatchObject({ id: 1, name: "John" });
});

// this works
test("pg-mem without drizzle", () => {
	const inMemDb = newDb();

	inMemDb.public.query(`
		CREATE TABLE users (
			id SERIAL PRIMARY KEY,
			name TEXT NOT NULL
		);
	`);
	inMemDb.public.query("INSERT INTO users (id, name) VALUES (1, 'John')");

	const { rows } = inMemDb.public.query("SELECT * FROM users");

	expect(rows[0]).toMatchObject({ id: 1, name: "John" });
});
