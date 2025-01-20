import { Elysia, t } from "elysia";
import {
  createOrder,
  getOrders,
  getUsersOrders,
} from "../../controllers/orderContoller";
import { status } from "../../controllers/orderContoller";
import cookie from "@elysiajs/cookie";
import robokassa from "node-robokassa";
import { updateOrderStatus } from "../../utils/updateOrderStatus";
import jwt from "@elysiajs/jwt";

interface UserData {
  orderId: number;
}

const robokassaHelper = new robokassa.RobokassaHelper({
  merchantLogin: "musandcoru",
  hashingAlgorithm: "MD5",
  password1: "egor0827",
  password2: "egor08273",
  testMode: true, // Set test mode as needed
  resultUrlRequestMethod: "POST",
});

const orderRoutes = new Elysia({ prefix: "/order" })
  .use(
    jwt({
      name: "jwt",
      secret: Bun.env.JWT_SECRET!,
    })
  )
  .get("/", () => getOrders(), {})
  .get(
    "/:userId",
    ({ params: { userId } }) => {
      return getUsersOrders(userId);
    },
    {
      params: t.Object({
        userId: t.Numeric(),
      }),
    }
  )

  .post(
    "/",
    ({ body: { userId, status: statusBody, address, postIndex } }) => {
      const validStatuses: status[] = ["Created", "InProgress", "Finished"];
      if (!validStatuses.includes(statusBody as status)) {
        throw new Error("Invalid status value");
      }

      try {
        createOrder({
          userId,
          status: statusBody as status,
          address,
          postIndex,
        });
      } catch (error) {
        return error;
      }
      return {
        success: true,
        data: statusBody,
        message: "Created successfully",
      };
    },
    {
      body: t.Object({
        userId: t.Numeric(),
        status: t.String(),
        address: t.String(),
        postIndex: t.Numeric(),
      }),
    }
  )
  .post("/create-payment", async ({ body, set }) => {
    const { outSum, invDesc, options } = body;

    try {
      const paymentUrl = robokassaHelper.generatePaymentUrl(
        outSum,
        invDesc,
        options
      );
      set.status = 200;
      return { paymentUrl };
    } catch (error) {
      set.status = 500;
      return { error: "Failed to create payment URL", errorDetails: error };
    }
  })
  .post("/robokassa/callback", async ({ request, set }) => {
    robokassaHelper.handleResultUrlRequest(
      request,
      set,
      async function (values, userData) {
        console.log({
          values: values, // Will contain general values like "invId" and "outSum"
          userData: userData, // Will contain all your custom data passed previously, e.g.: "productId"
        });
        await updateOrderStatus(userData.orderId, "InProgress");

        // You could return "false" here in order to throw error instead of success to Robokassa.
        // return false;

        // You could also return promise here.
        // return Promise.resolve();
      }
    );
  });

export default orderRoutes;
