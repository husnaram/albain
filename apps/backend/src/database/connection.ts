import { Database } from "bun:sqlite";
import { join } from "path";
import { mkdirSync } from "fs";

const dataDir = join(import.meta.dir, "../../../../data");
mkdirSync(dataDir, { recursive: true });

const DB_PATH = join(dataDir, "albain.db");

const db = new Database(DB_PATH, { create: true });

// Enable WAL mode untuk performa lebih baik
db.run("PRAGMA journal_mode = WAL");
db.run("PRAGMA foreign_keys = ON");

export default db;
