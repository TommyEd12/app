export const authorizeAdmin = () => ({
    async beforeHandle({ cookie, set }) {
        const role = cookie.get("role");

        if (!role) {
            set.status = 401;
            return "Unauthorized: No role cookie found";
        }
        if (role !== "admin") {
            set.status = 403;
            return "Forbidden: Insufficient privileges";
        }
    },
});

