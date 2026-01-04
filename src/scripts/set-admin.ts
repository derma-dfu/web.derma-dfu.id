
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../db/schema";
import { eq } from "drizzle-orm";
import * as dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});
const db = drizzle(pool, { schema });

async function main() {
    const email = "iddermadfu@gmail.com";
    console.log(`Searching for user with email: ${email}`);

    const user = await db.query.user.findFirst({
        where: eq(schema.user.email, email),
    });

    if (!user) {
        console.error("User not found!");
        process.exit(1);
    }

    console.log(`Found user: ${user.name} (${user.id})`);
    console.log(`Current role: ${user.role}`);

    console.log("Updating role to 'admin'...");
    await db.update(schema.user)
        .set({ role: "admin" })
        .where(eq(schema.user.id, user.id));

    console.log("Successfully updated user role to admin.");
    process.exit(0);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
