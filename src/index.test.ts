import type { NodePgClient } from "drizzle-orm/node-postgres";
import { vi } from "vitest";
import { db } from "./index";
import { user } from "./schema";

vi.mock("./index", async () => {
	const { drizzle } = await import("drizzle-orm/node-postgres");
	const { migrate } = await import("drizzle-orm/node-postgres/migrator");
	const { newDb } = await import("pg-mem");

	const inMemoryDb = newDb().adapters.createPg().Client as NodePgClient;
	const db = drizzle(inMemoryDb);

	await migrate(db, { migrationsFolder: "drizzle" }).catch((err) =>
		console.error(err)
	);

	return { db };
});

test("in memory db works", async () => {
	await db.insert(user).values({ id: 1, name: "John" }).execute();

	const result = await db.select().from(user).limit(1).execute();
	expect(result).toMatchObject({ id: 1, name: "John" });
});