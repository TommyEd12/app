import { Elysia, t } from "elysia";
import { createOrder, getUsersOrders } from "../../controllers/orderContoller";
import { status } from "../../controllers/orderContoller";
import cookie from "@elysiajs/cookie";

const orderRoutes = new Elysia({ prefix: "/order" })
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

      return createOrder({
        userId,
        status: statusBody as status,
        address,
        postIndex

      });
    },
    {
      body: t.Object({
        userId: t.Numeric(),
        status: t.String(),
        address: t.String(),
        postIndex: t.Numeric()
      }),
    }
  )
  .post("/createOrder", async ({}) => {
    // fetch("https://api.yookassa.ru/v3/payments", {
    //   body: JSON.stringify({
    //     amount: { value: "2.00", currency: "RUB" },
    //     payment_method_data: { type: "bank_card" },
    //     confirmation: {
    //       type: "redirect",
    //       return_url: "https://www.example.com/return_url",
    //     },
    //     description: "Order No. 72",
    //   }),
    //   headers: {
    //     Authorization: "Basic PFNob3A=",
    //     "Content-Type": "application/json",
    //     "Idempotence-Key": "<Idempotence Key>",
    //   },
    //   method: "POST",
    // });
    const YooKassa = require("yookassa");

    const yooKassa = new YooKassa({
      shopId: "54401",
      secretKey: "test_Fh8hUAVVBGUGbjmlzba6TB0iyUbos_lueTHE-axOwM0",
    });

    const payment = await yooKassa.createPayment({
      amount: {
        value: "2.00",
        currency: "RUB",
      },
      payment_method_data: {
        type: "bank_card",
      },
      confirmation: {
        type: "redirect",
        return_url: "http://localhost:5173/",
      },
      description: "Заказ №72",
    });
    return payment.confirmation.confirmation_url
  });

export default orderRoutes;
