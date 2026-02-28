import { endpoints } from "@/config";
import { api, APIResponse, Pagination } from "@/lib/api";

export interface PaymentRequest {
  id: string;
  userId: string;
  passTypeId: string;
  amountCents: number;
  screenshotUrl: string | null;
  status: "pending" | "approved" | "rejected";
  reviewedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  user: {
    email: string;
    firstName: string;
    lastName: string | null;
  };
  passType: {
    slug: string;
    name: string;
    amountCents: number;
  };
}

export interface UpgradeRequest {
  id: string;
  userId: string;
  fromUserPassId: string;
  toPassTypeId: string;
  amountCents: number;
  screenshotUrl: string | null;
  status: "pending" | "approved" | "rejected";
  reviewedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  user: {
    email: string;
    firstName: string;
    lastName: string | null;
  };
  toPassType: {
    slug: string;
    name: string;
    amountCents: number;
  };
}

export namespace PassesServices {
  export function getPaymentRequests({
    page,
    limit,
    status,
  }: {
    page: number;
    limit: number;
    status?: string;
  }) {
    return api.get<
      APIResponse<{ paymentRequests: PaymentRequest[]; pagination: Pagination }>
    >(endpoints.passes.paymentRequests.endpoint, {
      params: { page, limit, ...(status ? { status } : {}) },
    });
  }

  export function reviewPaymentRequest(
    id: string,
    body: { status: "approved" | "rejected"; rejectionReason?: string },
  ) {
    return api.patch<APIResponse<{ paymentRequest: { id: string; status: string } }>>(
      `${endpoints.passes.paymentRequests.endpoint}/${id}`,
      body,
    );
  }

  export function getUpgradeRequests({
    page,
    limit,
    status,
  }: {
    page: number;
    limit: number;
    status?: string;
  }) {
    return api.get<
      APIResponse<{ upgradeRequests: UpgradeRequest[]; pagination: Pagination }>
    >(endpoints.passes.upgradeRequests.endpoint, {
      params: { page, limit, ...(status ? { status } : {}) },
    });
  }

  export function reviewUpgradeRequest(
    id: string,
    body: { status: "approved" | "rejected"; rejectionReason?: string },
  ) {
    return api.patch<APIResponse<{ upgradeRequest: { id: string; status: string } }>>(
      `${endpoints.passes.upgradeRequests.endpoint}/${id}`,
      body,
    );
  }

  export function getPaymentConfig() {
    return api.get<APIResponse<{ paymentQrUrl: string | null }>>(
      endpoints.passes.paymentConfig.endpoint,
    );
  }

  export function updatePaymentConfig(body: { paymentQrUrl: string }) {
    return api.patch<APIResponse<{ paymentQrUrl: string | null }>>(
      endpoints.passes.paymentConfig.endpoint,
      body,
    );
  }

  export function uploadImage(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return api.post<APIResponse<{ url: string }>>(
      endpoints.passes.uploadScreenshot.endpoint,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
  }
}
