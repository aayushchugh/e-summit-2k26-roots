export const endpoints = {
  auth: {
    requestOtp: {
      query: "requestOtp",
      endpoint: "/v1/auth/request-otp",
    },
    verifyOtp: {
      query: "verifyOtp",
      endpoint: "/v1/auth/verify-otp",
    },
    me: {
      query: "me",
      endpoint: "/v1/auth/me",
    },
    logout: {
      query: "logout",
      endpoint: "/v1/auth/logout",
    },
  },
  users: {
    getAll: {
      query: "getAllUsers",
      endpoint: "/v1/users",
    },
  },
};
