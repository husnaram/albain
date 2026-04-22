import db from "./connection";
import { migrate } from "./migrations/001_create_products";

export function initializeDatabase() {
  migrate();
  return db;
}

export default db;
