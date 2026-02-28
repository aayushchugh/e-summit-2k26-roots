"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { endpoints } from "@/config";
import { UserServices } from "@/services/user-services";
import { UsersListTable } from "../components/users-list-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 10;
const SKELETON_ROWS = 10;

export function UsersPage() {
  const [page, setPage] = useState(1);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: [endpoints.users.getAll.query, page],
    queryFn: () => UserServices.getAllUsers({ page, limit: PAGE_SIZE }),
  });

  if (isPending) {
    return (
      <div className="space-y-4">
        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Avatar</TableHead>
                <TableHead>First Name</TableHead>
                <TableHead>Last Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
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
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-destructive/50 bg-destructive/5 p-8 text-center">
        <p className="text-muted-foreground">
          Failed to load users. You may not have permission or the server is unavailable.
        </p>
        <Button variant="outline" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div>
      <UsersListTable
        users={data?.data.payload.users || []}
        pagination={data?.data.payload.pagination}
        onPageChange={setPage}
      />
    </div>
  );
}
