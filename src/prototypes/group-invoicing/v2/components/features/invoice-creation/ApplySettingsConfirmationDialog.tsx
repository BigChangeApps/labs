import { ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/registry/ui/dialog";
import { Button } from "@/registry/ui/button";
import type { UniversalSettings, LevelOfDetail } from "../../pages/UnifiedInvoiceWorkspace";

interface SettingChange {
  label: string;
  from: string;
  to: string;
}

interface ApplySettingsConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  originalSettings: UniversalSettings;
  newSettings: UniversalSettings;
  invoiceCount: number;
  onApplyToAll: () => void;
  onApplyToCurrentOnly: () => void;
}

// Human-readable labels for settings
const levelOfDetailLabels: Record<LevelOfDetail, string> = {
  summary: "Summary",
  partial: "Partial",
  detailed: "Detailed",
};

const bankAccountLabels: Record<string, string> = {
  barclays: "Barclays 1234",
  hsbc: "HSBC 5678",
  lloyds: "Lloyds 9012",
};

const currencyLabels: Record<string, string> = {
  gbp: "GBP",
  usd: "USD",
  eur: "EUR",
};

const contactLevelLabels: Record<string, string> = {
  contact: "Contact",
  site: "Site",
};

function getSettingChanges(
  original: UniversalSettings,
  updated: UniversalSettings
): SettingChange[] {
  const changes: SettingChange[] = [];

  if (original.levelOfDetail !== updated.levelOfDetail) {
    changes.push({
      label: "Level of detail",
      from: levelOfDetailLabels[original.levelOfDetail],
      to: levelOfDetailLabels[updated.levelOfDetail],
    });
  }

  if (original.contactLevel !== updated.contactLevel) {
    changes.push({
      label: "Invoice grouping",
      from: contactLevelLabels[original.contactLevel] || original.contactLevel,
      to: contactLevelLabels[updated.contactLevel] || updated.contactLevel,
    });
  }

  if (original.bankAccount !== updated.bankAccount) {
    changes.push({
      label: "Bank account",
      from: bankAccountLabels[original.bankAccount] || original.bankAccount,
      to: bankAccountLabels[updated.bankAccount] || updated.bankAccount,
    });
  }

  if (original.currency !== updated.currency) {
    changes.push({
      label: "Currency",
      from: currencyLabels[original.currency] || original.currency.toUpperCase(),
      to: currencyLabels[updated.currency] || updated.currency.toUpperCase(),
    });
  }

  if (original.nominalCode !== updated.nominalCode) {
    changes.push({
      label: "Nominal code",
      from: original.nominalCode,
      to: updated.nominalCode,
    });
  }

  if (original.departmentCode !== updated.departmentCode) {
    changes.push({
      label: "Department",
      from: original.departmentCode,
      to: updated.departmentCode,
    });
  }

  if (original.showLogo !== updated.showLogo) {
    changes.push({
      label: "Show logo",
      from: original.showLogo ? "On" : "Off",
      to: updated.showLogo ? "On" : "Off",
    });
  }

  if (original.showTcs !== updated.showTcs) {
    changes.push({
      label: "Show T&Cs",
      from: original.showTcs ? "On" : "Off",
      to: updated.showTcs ? "On" : "Off",
    });
  }

  if (original.customLine !== updated.customLine) {
    changes.push({
      label: "Custom line",
      from: original.customLine ? "On" : "Off",
      to: updated.customLine ? "On" : "Off",
    });
  }

  return changes;
}

export function ApplySettingsConfirmationDialog({
  open,
  onOpenChange,
  originalSettings,
  newSettings,
  invoiceCount,
  onApplyToAll,
  onApplyToCurrentOnly,
}: ApplySettingsConfirmationDialogProps) {
  const changes = getSettingChanges(originalSettings, newSettings);

  const handleApplyToAll = () => {
    onApplyToAll();
    onOpenChange(false);
  };

  const handleApplyToCurrentOnly = () => {
    onApplyToCurrentOnly();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Apply settings</DialogTitle>
          <DialogDescription className="pt-2">
            {changes.length === 1
              ? "You've made the following change:"
              : `You've made ${changes.length} changes:`}
          </DialogDescription>
        </DialogHeader>

        <div className="py-0">
          <ul className="space-y-2">
            {changes.map((change, index) => (
              <li
                key={index}
                className="flex items-center gap-2 text-sm bg-hw-surface-subtle rounded-md px-3 py-2"
              >
                <span className="text-hw-text-secondary font-medium min-w-[100px]">
                  {change.label}
                </span>
                <span className="text-hw-text">{change.from}</span>
                <ArrowRight className="h-3.5 w-3.5 text-hw-text-secondary shrink-0" />
                <span className="text-hw-text font-medium">{change.to}</span>
              </li>
            ))}
          </ul>

          <p className="mt-4 text-sm text-hw-text-secondary">
            Would you like to apply {changes.length === 1 ? "this change" : "these changes"} to all
            invoices in this workspace, or just the current invoice?
          </p>
        </div>

        <DialogFooter className="gap-4 sm:gap-4 flex-col sm:flex-col">
          <Button onClick={handleApplyToAll} className="w-full">
            Apply to all {invoiceCount} invoice{invoiceCount !== 1 ? "s" : ""}
          </Button>
          <Button variant="outline" onClick={handleApplyToCurrentOnly} className="w-full">
            Apply to this invoice only
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

