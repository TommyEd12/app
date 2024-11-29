import { Elysia } from "elysia";
import userRoutes from "./routes/userRoutes";
import productRoutes from "./routes/productRoutes";
import orderRoutes from "./routes/orderRoutes";
import jwt from "@elysiajs/jwt";
import { cookie } from "@elysiajs/cookie";

const app = new Elysia({cookie:{
  secrets: ["awd"]
}});
app
  .use(
    jwt({
      name: "jwt",
      secret: "Fischl von Luftschloss Narfidort",
    })
  )
  .group("api", (app) => app.use(userRoutes))
  .group("api", (app) => app.use(productRoutes))
  .group("api", (app) => app.use(orderRoutes))
  
  .listen(process.env.PORT || 3049);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);