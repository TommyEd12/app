import { Context } from "elysia";
import { jwt } from "@elysiajs/jwt";

interface JwtPayload {
  email: string;
  password?: string; // password should not be stored in the JWT
  role: "user" | "admin";
}

export const authorizeAdmin = () => ({
  async beforeHandle({ cookie, set, jwt }: Context) {
    // Get the token from the 'auth' cookie
    const token = cookie.get("auth");

    if (!token) {
      set.status = 401;
      return "Unauthorized: No authentication token found";
    }

    try {
      // Verify and decode the JWT
      const payload = await jwt.verify<JwtPayload>(token);

      if (!payload || payload.role !== "admin") {
        set.status = 403;
        return "Forbidden: Insufficient privileges";
      }
    } catch (error) {
      set.status = 401;
      return "Invalid authentication token";
    }
  },
});
