import { Elysia } from "elysia";
import userRoutes from "./routes/userRoutes";
import cors from "@elysiajs/cors";
import productRoutes from "./routes/productRoutes";
import orderRoutes from "./routes/orderRoutes";
import jwt from "@elysiajs/jwt";
import orderProductsRoutes from "./routes/orderProducts";
import brandRoutes from "./routes/brandRoutes";
import categoryRoutes from "./routes/categoriesRoutes";
import sliderContentRoutes from "./routes/sliderContentRoutes";
import cookie from "@elysiajs/cookie";

const app = new Elysia();
app;
app
  .use(
    jwt({
      name: "jwt",
      secret: Bun.env.JWTSECRET!,
    })
  )
  .use(
    cors({
      origin: ["http://localhost:5000", "http://musandco"],
      credentials: true,
    })
  )
  .group("api", (app) => app.use(userRoutes))
  .group("api", (app) => app.use(sliderContentRoutes))
  .group("api", (app) => app.use(categoryRoutes))
  .group("api", (app) => app.use(productRoutes))
  .group("api", (app) => app.use(orderRoutes))
  .group("api", (app) => app.use(orderProductsRoutes))
  .group("api", (app) => app.use(brandRoutes))
  .listen(Bun.env.PORT || 3049);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
