import { Elysia } from "elysia";
import userRoutes from "./routes/userRoutes";
import productRoutes from "./routes/productRoutes";
import orderRoutes from "./routes/orderRoutes";
import jwt from "@elysiajs/jwt";
import orderProductsRoutes from "./routes/orderProducts";
import brandRoutes from "./routes/brandRoutes";
import categoryRoutes from "./routes/categoriesRoutes";
import sliderContentRoutes from "./routes/sliderContentRoutes";

const app = new Elysia({
  cookie: {
    secrets: ["awd"],
  },
});
app
  .use(
    jwt({
      name: "jwt",
      secret: Bun.env.JWTSECRET!,
    })
  )
  .group("api", (app) => app.use(userRoutes))
  .group("api", (app) => app.use(sliderContentRoutes))
  .group("api", (app) => app.use(categoryRoutes))
  .group("api", (app) => app.use(productRoutes))
  .group("api", (app) => app.use(orderRoutes))
  .group("api", (app) => app.use(orderProductsRoutes))
  .group("api", (app) => app.use(brandRoutes))
  .listen(process.env.PORT || 3049);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
