import { Elysia, t} from "elysia";
import { createOrder, getUsersOrders } from "../../controllers/orderContoller";
import {status} from "../../controllers/orderContoller"
import cookie from "@elysiajs/cookie";

const orderRoutes = new Elysia({ prefix: "/order" })
  .get("/:userId", ({params: {userId}}) => getUsersOrders(userId), {
    params: t.Object({
        userId: t.Numeric()
    })
  })
  .post(
    "/",
    ({ body: { userId, status: statusBody } }) => {
      const validStatuses: status[] = ["Created", "InProgress", "Finished"];
      if (!validStatuses.includes(statusBody as status)) {
        throw new Error("Invalid status value");
      }

      return createOrder({
        userId,
        status: statusBody as status,
      });
    },
    {
      body: t.Object({
        userId: t.Numeric(),
        status: t.String(),
      }),
    }
  
);

export default orderRoutes;
