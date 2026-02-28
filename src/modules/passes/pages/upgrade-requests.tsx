"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { endpoints } from "@/config";
import { PassesServices, UpgradeRequest } from "@/services/passes-services";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const PAGE_SIZE = 20;

export function UpgradeRequestsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [reviewModal, setReviewModal] = useState<{
    request: UpgradeRequest;
    action: "approved" | "rejected";
  } | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [screenshotModal, setScreenshotModal] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: [endpoints.passes.upgradeRequests.query, page, statusFilter],
    queryFn: () =>
      PassesServices.getUpgradeRequests({
        page,
        limit: PAGE_SIZE,
        status: statusFilter || undefined,
      }),
  });

  const reviewMutation = useMutation({
    mutationFn: ({
      id,
      status,
      rejectionReason,
    }: {
      id: string;
      status: "approved" | "rejected";
      rejectionReason?: string;
    }) => PassesServices.reviewUpgradeRequest(id, { status, rejectionReason }),
    onSuccess: (_, variables) => {
      toast.success(
        variables.status === "approved"
          ? "Upgrade request approved"
          : "Upgrade request rejected",
      );
      queryClient.invalidateQueries({
        queryKey: [endpoints.passes.upgradeRequests.query],
      });
      setReviewModal(null);
      setRejectionReason("");
    },
  });

  const handleReview = () => {
    if (!reviewModal) return;
    reviewMutation.mutate({
      id: reviewModal.request.id,
      status: reviewModal.action,
      rejectionReason:
        reviewModal.action === "rejected" ? rejectionReason : undefined,
    });
  };

  const upgradeRequests = data?.data.payload.upgradeRequests ?? [];
  const pagination = data?.data.payload.pagination;

  if (isPending) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Upgrade Requests</h1>
        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>To Pass</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Screenshot</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Upgrade Requests</h1>
        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-destructive/50 bg-destructive/5 p-8 text-center">
          <p className="text-muted-foreground">Failed to load upgrade requests.</p>
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Upgrade Requests</h1>
        <div className="flex gap-2">
          {["pending", "approved", "rejected", ""].map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setStatusFilter(s);
                setPage(1);
              }}
            >
              {s === "" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>To Pass</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Screenshot</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {upgradeRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No upgrade requests found.
                </TableCell>
              </TableRow>
            ) : (
              upgradeRequests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {req.user.firstName} {req.user.lastName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {req.user.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{req.toPassType.name}</TableCell>
                  <TableCell>₹{(req.amountCents / 100).toFixed(0)}</TableCell>
                  <TableCell>
                    {req.screenshotUrl ? (
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 h-auto"
                        onClick={() => setScreenshotModal(req.screenshotUrl!)}
                      >
                        View
                      </Button>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        req.status === "approved"
                          ? "default"
                          : req.status === "rejected"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {req.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {req.status === "pending" && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() =>
                            setReviewModal({
                              request: req,
                              action: "approved",
                            })
                          }
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            setReviewModal({
                              request: req,
                              action: "rejected",
                            })
                          }
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total}{" "}
            total)
          </p>
          <Pagination className="mx-0 w-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  aria-disabled={page <= 1}
                  className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink isActive>{page}</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setPage((p) => Math.min(pagination.totalPages, p + 1))
                  }
                  aria-disabled={page >= pagination.totalPages}
                  className={
                    page >= pagination.totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Review dialog */}
      <Dialog
        open={!!reviewModal}
        onOpenChange={(open) => {
          if (!open) {
            setReviewModal(null);
            setRejectionReason("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewModal?.action === "approved"
                ? "Approve Upgrade"
                : "Reject Upgrade"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {reviewModal?.action === "approved"
                ? `Approve upgrade for ${reviewModal.request.user.firstName} to ${reviewModal.request.toPassType.name}?`
                : `Reject upgrade for ${reviewModal?.request.user.firstName} to ${reviewModal?.request.toPassType.name}?`}
            </p>

            {reviewModal?.action === "rejected" && (
              <div>
                <label className="text-sm font-medium">
                  Rejection reason (optional)
                </label>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Screenshot unclear..."
                  className="mt-1"
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setReviewModal(null);
                setRejectionReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant={
                reviewModal?.action === "approved" ? "default" : "destructive"
              }
              onClick={handleReview}
              disabled={reviewMutation.isPending}
            >
              {reviewMutation.isPending
                ? "Processing..."
                : reviewModal?.action === "approved"
                  ? "Confirm Approve"
                  : "Confirm Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Screenshot viewer */}
      <Dialog
        open={!!screenshotModal}
        onOpenChange={(open) => {
          if (!open) setScreenshotModal(null);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Payment Screenshot</DialogTitle>
          </DialogHeader>
          {screenshotModal && (
            <img
              src={screenshotModal}
              alt="Payment screenshot"
              className="w-full rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
