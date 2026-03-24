import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

type Mode = "approve" | "reject" | null;

export function DelegationApprovalDialog({
  open,
  mode,
  onOpenChange,
  onApprove,
  onReject,
}: {
  open: boolean;
  mode: Mode;
  onOpenChange: (open: boolean) => void;
  onApprove: () => void;
  onReject: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {mode === "approve" ? "Approve delegation?" : mode === "reject" ? "Reject delegation?" : "Delegation"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {mode === "approve"
              ? "This will issue an approval token and move the request to Approved."
              : mode === "reject"
                ? "The agent will be notified. You can add an optional reason below."
                : ""}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {mode === "reject" && (
          <div className="space-y-2 py-2">
            <Label htmlFor="reject-reason" className="text-xs">
              Reason (optional)
            </Label>
            <Input
              id="reject-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. exceeds policy limit"
            />
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          {mode === "approve" ? (
            <AlertDialogAction onClick={onApprove}>Approve</AlertDialogAction>
          ) : (
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => onReject(reason)}
            >
              Reject
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
