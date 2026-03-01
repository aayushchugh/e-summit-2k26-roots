"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { endpoints } from "@/config";
import { CompetitionsService } from "@/services/competition-services";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const PAGE_SIZE = 20;
const SKELETON_ROWS = 5;

export function CompetitionRegistrationsPage() {
  const [page, setPage] = useState(1);
  const [competitionSlug, setCompetitionSlug] = useState<string | undefined>(
    undefined,
  );
  const [selectedRegistrationId, setSelectedRegistrationId] = useState<
    string | null
  >(null);

  const { data: competitionsData } = useQuery({
    queryKey: [endpoints.competitions.list.query],
    queryFn: () => CompetitionsService.getCompetitions(),
  });

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: [
      endpoints.competitions.registrations.query,
      page,
      competitionSlug ?? "all",
    ],
    queryFn: () =>
      CompetitionsService.getCompetitionRegistrations({
        page,
        limit: PAGE_SIZE,
        competitionSlug: competitionSlug || undefined,
      }),
  });

  const { data: registrationDetailData, isPending: isDetailPending } =
    useQuery({
      queryKey: ["competitionRegistration", selectedRegistrationId],
      queryFn: () =>
        CompetitionsService.getCompetitionRegistrationById(
          selectedRegistrationId!,
        ),
      enabled: !!selectedRegistrationId,
    });

  const competitions = competitionsData?.data?.payload?.competitions ?? [];
  const registrations = data?.data?.payload?.registrations ?? [];
  const pagination = data?.data?.payload?.pagination;
  const registrationDetail =
    registrationDetailData?.data?.payload?.registration ?? null;

  if (isPending) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Competition Registrations</h1>
        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Competition</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Leader</TableHead>
                <TableHead>E-Summit ID</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
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
        <h1 className="text-2xl font-bold">Competition Registrations</h1>
        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-destructive/50 bg-destructive/5 p-8 text-center">
          <p className="text-muted-foreground">
            Failed to load competition registrations.
          </p>
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Competition Registrations</h1>
        <Select
          value={competitionSlug ?? "all"}
          onValueChange={(v) => {
            setCompetitionSlug(
              v === "all" || v == null ? undefined : (v as string),
            );
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[220px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All competitions</SelectItem>
            {competitions.map((c) => (
              <SelectItem key={c.id} value={c.slug}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Competition</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Leader</TableHead>
              <TableHead>E-Summit ID</TableHead>
              <TableHead>Members</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {registrations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No registrations found.
                </TableCell>
              </TableRow>
            ) : (
              registrations.map((reg) => (
                <TableRow
                  key={reg.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedRegistrationId(reg.id)}
                >
                  <TableCell className="font-medium">
                    {reg.competitionName}
                  </TableCell>
                  <TableCell>{reg.teamName ?? "—"}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {reg.leaderFirstName}{" "}
                        {reg.leaderLastName ?? ""}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {reg.leaderEmail}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {reg.leaderEsummitId ?? "—"}
                  </TableCell>
                  <TableCell>{reg.memberCount}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(reg.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={!!selectedRegistrationId}
        onOpenChange={(open) => {
          if (!open) setSelectedRegistrationId(null);
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Team members</DialogTitle>
          </DialogHeader>
          {isDetailPending || !registrationDetail ? (
            <div className="space-y-2 py-4">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-32" />
              <div className="mt-4 space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">
                  {registrationDetail.competitionName}
                  {registrationDetail.teamName && (
                    <span className="text-muted-foreground font-normal">
                      {" "}
                      · {registrationDetail.teamName}
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  Registered{" "}
                  {new Date(registrationDetail.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="overflow-hidden rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">#</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>E-Summit ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {registrationDetail.members.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="h-16 text-center text-muted-foreground"
                        >
                          No members
                        </TableCell>
                      </TableRow>
                    ) : (
                      registrationDetail.members.map((member) => (
                        <TableRow key={member.userId}>
                          <TableCell className="text-muted-foreground">
                            {member.position ?? "—"}
                          </TableCell>
                          <TableCell>
                            {member.firstName}{" "}
                            {member.lastName ?? ""}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {member.email}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {member.esummitId ?? "—"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">
            Page {pagination.page} of {pagination.totalPages} (
            {pagination.total} total)
          </p>
          <Pagination className="mx-0 w-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  aria-disabled={page <= 1}
                  className={
                    page <= 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
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
    </div>
  );
}
