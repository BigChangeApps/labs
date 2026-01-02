import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/registry/ui/dialog";
import { Button } from "@/registry/ui/button";

interface FinanceResetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobsUsingDefault: number;
  jobsWithOverrides: number;
  onKeepCustom: () => void;
  onResetAll: () => void;
}

export function FinanceResetDialog({
  open,
  onOpenChange,
  jobsUsingDefault,
  jobsWithOverrides,
  onKeepCustom,
  onResetAll,
}: FinanceResetDialogProps) {
  const handleKeepCustom = () => {
    onKeepCustom();
    onOpenChange(false);
  };

  const handleResetAll = () => {
    onResetAll();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reset job finance settings?</DialogTitle>
          <DialogDescription className="pt-2">
            Changing the default will affect:
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <ul className="space-y-2 text-sm text-hw-text">
            <li className="flex items-start gap-2">
              <span className="text-hw-text-secondary">-</span>
              <span>
                <span className="font-medium">{jobsUsingDefault}</span>{" "}
                {jobsUsingDefault === 1 ? "job" : "jobs"} using the current default
              </span>
            </li>
            {jobsWithOverrides > 0 && (
              <li className="flex items-start gap-2">
                <span className="text-hw-text-secondary">-</span>
                <span>
                  <span className="font-medium">{jobsWithOverrides}</span>{" "}
                  {jobsWithOverrides === 1 ? "job has" : "jobs have"} custom settings
                </span>
              </li>
            )}
          </ul>

          {jobsWithOverrides > 0 && (
            <p className="mt-4 text-sm text-hw-text-secondary">
              Do you want to reset the custom settings to use the new default?
            </p>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleKeepCustom}>
            Keep custom
          </Button>
          <Button onClick={handleResetAll}>
            Reset all to default
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

