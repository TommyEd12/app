import { Elysia, t} from "elysia";
import { getUserBuId, getUsers } from "../../controllers/userContoller";

const userRoutes = new Elysia({ prefix: "/user" })
  .get("/", () => getUsers())
  .get("/:id", ({params: {id}}) => getUserBuId(id), {
    params: t.Object({
        id: t.Numeric()
    })
  })
  .post("/", () => "create user");

export default userRoutes;
