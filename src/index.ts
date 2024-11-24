import { Elysia } from "elysia";
import userRoutes from "./routes/userRoutes";
import productRoutes from "./routes/productRoutes";

const app = new Elysia();

app
  .group("/api", (app)=>app.use(userRoutes))
  .group("api",(app)=>app.use(productRoutes) )
  .listen(process.env.PORT || 3049)



console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
