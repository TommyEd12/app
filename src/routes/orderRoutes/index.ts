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
  .get("/", () => getOrders())
  .get("/:userId", ({ params: { userId } }) => getUsersOrders(userId), {
    params: t.Object({
      userId: t.Numeric(),
    }),
  })

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
    const { outSum, invDesc, options } = body as {
      outSum: number;
      invDesc: string;
      options: any;
    };

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
    try {
      return await new Promise(async (resolve, reject) => {
        robokassaHelper.handleResultUrlRequest(
          request,
          {
            setHeader: (header, value) => {
              set.headers[header] = value;
            },
            status: (code: number) => {
              set.status = code;
            },
            send: (message: string) => {
              set.status = 400;
              resolve({ message: message });
            },
            end: () => {},
          },
          async (values, userData: UserData) => {
            console.log({
              values: values,
              userData: userData,
            });
            const orderId = userData?.orderId;

            if (!orderId) {
              reject(new Error("Order id not found in callback data"));
              return;
            }
            try {
              await updateOrderStatus(orderId, "InProgress");
              resolve({ message: "ok" });
            } catch (error) {
              reject(new Error("Failed to update order status" + error));
            }
          }
        );
      });
    } catch (error) {
      set.status = 500;
      return { error: "Failed to handle callback", errorDetails: error };
    }
  });

export default orderRoutes;
