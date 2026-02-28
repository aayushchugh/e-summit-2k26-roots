"use client";

import { useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { endpoints } from "@/config";
import { PassesServices } from "@/services/passes-services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function PaymentConfigPage() {
  const [urlInput, setUrlInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: [endpoints.passes.paymentConfig.query],
    queryFn: () => PassesServices.getPaymentConfig(),
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => PassesServices.uploadImage(file),
    onSuccess: (res) => {
      const url = res.data.payload.url;
      updateMutation.mutate({ paymentQrUrl: url });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (body: { paymentQrUrl: string }) =>
      PassesServices.updatePaymentConfig(body),
    onSuccess: () => {
      toast.success("Payment QR code updated successfully");
      queryClient.invalidateQueries({
        queryKey: [endpoints.passes.paymentConfig.query],
      });
      setUrlInput("");
      setFile(null);
      setPreview(null);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
      setUrlInput("");
    }
  };

  const handleSave = () => {
    if (file) {
      uploadMutation.mutate(file);
    } else if (urlInput.trim()) {
      updateMutation.mutate({ paymentQrUrl: urlInput.trim() });
    }
  };

  const currentQrUrl = data?.data.payload.paymentQrUrl;
  const isLoading =
    uploadMutation.isPending || updateMutation.isPending;

  if (isPending) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Payment Configuration</h1>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-48 w-48" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Payment Configuration</h1>
        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-destructive/50 bg-destructive/5 p-8 text-center">
          <p className="text-muted-foreground">Failed to load payment config.</p>
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Payment Configuration</h1>

      <Card>
        <CardHeader>
          <CardTitle>UPI Payment QR Code</CardTitle>
          <CardDescription>
            This QR code is shared across all pass purchases and upgrades on the
            frontend.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentQrUrl ? (
            <div>
              <p className="text-sm font-medium mb-2">Current QR</p>
              <img
                src={currentQrUrl}
                alt="Current UPI QR"
                className="w-48 h-48 rounded-lg border bg-white p-2"
              />
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-6 text-center">
              <p className="text-muted-foreground text-sm">
                No payment QR configured yet.
              </p>
            </div>
          )}

          <div className="space-y-4 border-t pt-4">
            <p className="text-sm font-medium">Update QR Code</p>

            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">
                Upload an image
              </label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileRef.current?.click()}
                >
                  Choose File
                </Button>
                <span className="text-sm text-muted-foreground">
                  {file ? file.name : "No file selected"}
                </span>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
              {preview && (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-32 h-32 rounded-lg border mt-2"
                />
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">or</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">
                Paste a URL
              </label>
              <Input
                placeholder="https://..."
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value);
                  setFile(null);
                  setPreview(null);
                }}
              />
            </div>

            <Button
              onClick={handleSave}
              disabled={isLoading || (!file && !urlInput.trim())}
            >
              {isLoading ? "Saving..." : "Save QR Code"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
