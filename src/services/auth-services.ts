import { api, APIResponse } from "@/lib/api";
import { endpoints } from "@/config/endpoints";
import { User } from "@/types";

export namespace AuthServices {
  export function requestOtp(email: string) {
    return api.post<APIResponse<{ message: string }>>(endpoints.auth.requestOtp.endpoint, {
      email,
    });
  }

  export function verifyOtp(email: string, otp: string) {
    return api.post<
      APIResponse<{
        accessToken: string;
        accessTokenExpiresAt: string;
        user: Pick<User, "id" | "email" | "firstName" | "lastName" | "role">;
      }>
    >(endpoints.auth.verifyOtp.endpoint, { email, otp });
  }

  export function getMe() {
    return api.get<APIResponse<{ user: User }>>(endpoints.auth.me.endpoint);
  }

  export function logout() {
    return api.get<APIResponse<null>>(endpoints.auth.logout.endpoint);
  }
}
