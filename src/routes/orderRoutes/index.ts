import { Elysia, t, Context } from "elysia";
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
import { renderToStaticMarkup } from "react-dom/server";
import orderEmail from "../../emails/orderEmail";
import { sendEmail } from "../../utils/sendEmail";

interface UserData {
  orderId: number;
  userEmail: string;
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
    async ({ body: { userId, status: statusBody, address, postIndex } }) => {
      const validStatuses: status[] = ["Created", "InProgress", "Finished"];
      if (!validStatuses.includes(statusBody as status)) {
        throw new Error("Invalid status value");
      }

      try {
        const orderId = await createOrder({
          userId,
          status: statusBody as status,
          address,
          postIndex,
        });
        return {
          success: true,
          data: orderId,
          message: "Created successfully",
        };
      } catch (error) {
        return error;
      }
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
    const { OutSum, invDesc, options } = body as {
      OutSum: number;
      invDesc: string;
      options: {
        userData: {
          orderId: number;
          userEmail: string;
        };
      };
    };

    try {
      const paymentUrl = robokassaHelper.generatePaymentUrl(
        OutSum,
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
  .get("/robokassa/callback", async (c: Context) => {
    console.log(c.query);
    console.log(c.params);
    console.log(JSON.stringify(c, undefined, 2));
    try {
      return await new Promise(async (resolve, reject) => {
        robokassaHelper.handleResultUrlRequest(
          c.request,
          c.set,
          async (values, userData: UserData) => {
            console.log(
              "myData" +
                JSON.stringify({
                  values: JSON.stringify(values),
                  userData: JSON.stringify(userData),
                })
            );
            const html = renderToStaticMarkup(orderEmail(values.OutSum));
            const orderId = userData?.orderId;
            const userEmail = userData?.userEmail;
            console.log("newData" + orderId, userEmail);
            const mailOptions = {
              from: Bun.env.AUTH_EMAIL!,
              to: userEmail,
              subject: "Ваш заказ",
              html,
            };
            await sendEmail(mailOptions);

            if (!orderId) {
              reject(new Error("Order id not found in callback data"));
              return;
            }
            try {
              await updateOrderStatus(orderId, "InProgress");
            } catch (error) {
              reject(new Error("Failed to update order status" + error));
            }
          },
          c.query
          // {
          //   setHeader: (header, value) => {
          //     c.set.headers[header] = value; // используем c.set.headers
          //   },
          //   end: async () => {
          //     try {
          //     } catch (err) {
          //       reject(new Error("Failed to set response status: " + err));
          //     }
          //   },
          // },
        );
      });
    } catch (error) {
      c.set.status = 500;
      return c.error(500);
    }
  });

export default orderRoutes;
