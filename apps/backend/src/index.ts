import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { staticPlugin } from "@elysiajs/static";
import { join } from "path";
import { initializeDatabase } from "./database";
import { productRoutes } from "./routes/products";

// Initialize database on startup
initializeDatabase();

const app = new Elysia()
  .use(cors())
  .use(
    staticPlugin({
      assets: join(import.meta.dir, "../../../uploads"),
      prefix: "/uploads",
    })
  )
  .use(productRoutes)
  .get("/", () => ({ message: "Albain API is running 🚀" }))
  .listen(3000);

console.log(`🚀 Albain API running at http://localhost:${app.server?.port}`);
