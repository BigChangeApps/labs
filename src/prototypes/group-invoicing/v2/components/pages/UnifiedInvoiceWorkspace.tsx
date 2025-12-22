import { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/registry/ui/button";
import { InvoiceCardList } from "../features/invoice-creation/InvoiceCardList";
import { LiveInvoicePreview } from "../features/invoice-creation/LiveInvoicePreview";
import { GlobalActionBar } from "../ui/GlobalActionBar";
import { InvoiceSettingsModal } from "../features/invoice-creation/InvoiceSettingsModal";
import { InlineSettingsPanel } from "../features/invoice-creation/InlineSettingsPanel";
import { formatCurrency, type Job } from "../../lib/mock-data";
import { useFeatureFlag } from "@/components/FeatureFlagsPopover";
import { useMediaQuery } from "@/registry/hooks/use-media-query";

// Toast notification component for sent invoices
function InvoiceSentToast({
  invoiceReference,
  onClose,
}: {
  invoiceReference: string;
  onClose: () => void;
}) {
  // Auto-dismiss after 5 seconds
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 left-6 z-50 flex items-start gap-3 px-4 py-3 bg-white rounded-card border border-hw-border shadow-card max-w-[320px]">
      <div className="shrink-0 pt-0.5">
        <CheckCircle2 className="w-4 h-4 text-hw-text" />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-hw-text leading-5">
          Invoice <span className="font-semibold">{invoiceReference}</span> sent
        </p>
        <p className="text-sm text-hw-text-secondary leading-5">
          This invoice has been successfully sent to the customer
        </p>
      </div>
    </div>
  );
}

// Types
export type LevelOfDetail = "summary" | "partial" | "detailed";
export type BreakdownLevel = "contact" | "site" | "job";

export interface JobWithLines {
  id: string;
  jobRef: string;
  completed: string;
  linesCount: number;
  selectedLinesCount: number;
  leftToInvoice: number;
  jobCategory: "External" | "Internal" | "External, Internal";
  isGroupJob: boolean;
  childJobs?: JobWithLines[];
  site?: string;
  engineerName?: string;
  jobStartDate?: string;
  time?: string;
  resource?: string;
  vehicle?: string;
}

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
}

export interface CustomLineItem {
  id: string;
  category: "labour" | "materials" | "other";
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface InvoiceData {
  id: string;
  invoiceNumber: number;
  invoiceNumberPrefix: string;
  name: string;
  address: string;
  jobs: JobWithLines[];
  originalJobIds: string[];
  title: string;
  reference: string;
  issueDate: string;
  dueDate: string;
  bankAccount: string;
  currency: string;
  notes: string;
  attachments: Attachment[];
  logo?: string;
  levelOfDetail: LevelOfDetail;
  isOverridden: boolean;
  selectedJobIds: Set<string>;
  selectedGroupLines: Set<string>;
  customLines: CustomLineItem[];
}

export interface UniversalSettings {
  levelOfDetail: LevelOfDetail;
  currency: string;
  bankAccount: string;
  nominalCode: string;
  departmentCode: string;
  contactLevel: string;
  showLogo: boolean;
  showTcs: boolean;
  customLine: boolean;
  rememberSelection: boolean;
}

// Helper to generate line items for a job
function generateLineItemsForJob(job: Job): Array<{
  id: string;
  category: "labour" | "materials" | "other";
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}> {
  const labourAmount = job.leftToInvoice * 0.6;
  const materialsAmount = job.leftToInvoice * 0.3;
  const otherAmount = job.leftToInvoice * 0.1;

  return [
    {
      id: `${job.id}-labour`,
      category: "labour",
      description: "Labour charges",
      quantity: 1,
      unitPrice: labourAmount,
      total: labourAmount,
    },
    {
      id: `${job.id}-materials`,
      category: "materials",
      description: "Materials and parts",
      quantity: 1,
      unitPrice: materialsAmount,
      total: materialsAmount,
    },
    {
      id: `${job.id}-other`,
      category: "other",
      description: "Other charges",
      quantity: 1,
      unitPrice: otherAmount,
      total: otherAmount,
    },
  ];
}

// Convert Job to JobWithLines
function convertJobToJobWithLines(job: Job, index: number): JobWithLines {
  const lineItems = generateLineItemsForJob(job);
  const categories = ["External", "Internal"] as const;
  const category = categories[index % 2];

  return {
    id: job.id,
    jobRef: job.jobRef,
    completed: job.completed,
    linesCount: lineItems.length,
    selectedLinesCount: lineItems.length,
    leftToInvoice: job.leftToInvoice,
    jobCategory: category,
    isGroupJob: false,
    site: job.site,
    engineerName: job.engineerName,
    jobStartDate: job.jobStartDate,
    time: job.time,
    resource: job.resource,
    vehicle: job.vehicle,
  };
}

// Generate invoice cards from jobs
function generateInvoiceCards(
  jobs: Job[],
  breakdown: BreakdownLevel,
  defaultLevelOfDetail: LevelOfDetail
): InvoiceData[] {
  let groupedJobs: Record<string, Job[]> = {};

  if (breakdown === "contact") {
    groupedJobs = jobs.reduce((acc, job) => {
      if (!acc[job.parent]) acc[job.parent] = [];
      acc[job.parent].push(job);
      return acc;
    }, {} as Record<string, Job[]>);
  } else if (breakdown === "site") {
    groupedJobs = jobs.reduce((acc, job) => {
      const key = job.site || job.parent;
      if (!acc[key]) acc[key] = [];
      acc[key].push(job);
      return acc;
    }, {} as Record<string, Job[]>);
  } else {
    groupedJobs = jobs.reduce((acc, job) => {
      acc[job.jobRef] = [job];
      return acc;
    }, {} as Record<string, Job[]>);
  }

  return Object.entries(groupedJobs).map(
    ([groupKey, groupJobs], groupIndex): InvoiceData => {
      const baseJob = groupJobs[0] || {
        id: "1",
        parent: groupKey,
        site: "",
        jobRef: "",
        completed: "",
        status: "Complete" as const,
        selling: 0,
        leftToInvoice: 0,
        progress: 0,
        jobType: "home_repair" as const,
      };

      // Convert actual jobs to JobWithLines
      const jobsWithLines: JobWithLines[] = groupJobs.map((job, idx) =>
        convertJobToJobWithLines(job, idx)
      );

      // Determine invoice name based on breakdown level
      const name =
        breakdown === "contact"
          ? baseJob.parent
          : breakdown === "site"
            ? baseJob.site || baseJob.parent
            : baseJob.jobRef;

      // Initialize selected job IDs - select all jobs by default
      const selectedJobIds = new Set<string>();
      const selectedGroupLines = new Set<string>();

      // Select all jobs by default
      jobsWithLines.forEach((job) => {
        selectedJobIds.add(job.id);
      });

      // Get address from first job's site
      const address = baseJob.site || "Address not available";

      return {
        id: `invoice-${groupIndex}`,
        invoiceNumber: 24245 + groupIndex,
        invoiceNumberPrefix: "IV",
        name,
        address,
        jobs: jobsWithLines,
        originalJobIds: groupJobs.map((job) => job.id),
        title: "Fire extinguisher service",
        reference: `243452`,
        issueDate: "",
        dueDate: "",
        bankAccount: "barclays",
        currency: "gbp",
        notes: "",
        attachments: [],
        logo: undefined,
        levelOfDetail: defaultLevelOfDetail,
        isOverridden: false,
        selectedJobIds,
        selectedGroupLines,
        customLines: [],
      };
    }
  );
}

export function UnifiedInvoiceWorkspace() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Feature flags
  const showApplyToAllCheckbox = useFeatureFlag("showApplyToAllCheckbox", false);
  const showInlineSettings = useFeatureFlag("showInlineSettings", false);
  
  // Responsive: Only show inline panel on large screens (1280px+)
  const isLargeScreen = useMediaQuery("(min-width: 1280px)");
  const showInlinePanel = showInlineSettings && isLargeScreen;

  // #region agent log
  // #endregion

  const locationState = (location.state || {}) as {
    selectedJobs?: Job[];
    breakdownLevel?: BreakdownLevel;
    levelOfDetail?: LevelOfDetail;
  };

  // Demo jobs for testing
  const demoJobs: Job[] = [
    {
      id: "demo-1",
      jobRef: "381910",
      site: "Next Arndale Manchester",
      parent: "Next Head Office",
      completed: "18 Mar 2024",
      status: "Complete",
      selling: 8393,
      leftToInvoice: 7500,
      progress: 100,
      jobType: "home_repair",
    },
    {
      id: "demo-2",
      jobRef: "382011",
      site: "Next Bull Ring Birmingham",
      parent: "Next Head Office",
      completed: "5 Mar 2024",
      status: "Complete",
      selling: 7450,
      leftToInvoice: 7500,
      progress: 100,
      jobType: "stacks",
    },
    {
      id: "demo-3",
      jobRef: "382012",
      site: "Next Leeds",
      parent: "Next Head Office",
      completed: "10 Mar 2024",
      status: "Complete",
      selling: 6200,
      leftToInvoice: 7500,
      progress: 100,
      jobType: "stacks",
    },
    {
      id: "demo-4",
      jobRef: "382013",
      site: "Next Sheffield",
      parent: "Next Head Office",
      completed: "12 Mar 2024",
      status: "Complete",
      selling: 5800,
      leftToInvoice: 7500,
      progress: 100,
      jobType: "stacks",
    },
  ];

  const selectedJobs =
    locationState.selectedJobs !== undefined
      ? locationState.selectedJobs
      : demoJobs;
  const breakdownLevel = locationState.breakdownLevel || "site";

  // Universal settings state - sync contactLevel with breakdownLevel from location
  const [universalSettings, setUniversalSettings] = useState<UniversalSettings>(
    {
      levelOfDetail: locationState.levelOfDetail || "partial",
      currency: "gbp",
      bankAccount: "barclays",
      nominalCode: "5001",
      departmentCode: "HS49301",
      contactLevel: breakdownLevel,
      showLogo: false,
      showTcs: false,
      customLine: false,
      rememberSelection: false,
    }
  );

  // Invoice cards state
  const [invoices, setInvoices] = useState<InvoiceData[]>(() =>
    generateInvoiceCards(
      selectedJobs,
      breakdownLevel,
      universalSettings.levelOfDetail
    )
  );

  // Active invoice selection
  const [activeInvoiceId, setActiveInvoiceId] = useState<string>(
    invoices[0]?.id || ""
  );

  // Settings modal state
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  // Sent invoice IDs
  const [sentInvoiceIds, setSentInvoiceIds] = useState<Set<string>>(new Set());

  // Toast notification state
  const [toastInvoice, setToastInvoice] = useState<{ id: string; reference: string } | null>(null);

  // Track if group has been saved
  const [isSaved, setIsSaved] = useState(false);

  // Check if any invoices have been sent
  const hasSentInvoices = sentInvoiceIds.size > 0;

  // Get active invoice
  const activeInvoice = useMemo(
    () => invoices.find((inv) => inv.id === activeInvoiceId) || invoices[0],
    [invoices, activeInvoiceId]
  );

  // Calculate totals for all invoices
  const totals = useMemo(() => {
    let subtotal = 0;

    invoices.forEach((invoice) => {
      invoice.jobs.forEach((job) => {
        if (job.isGroupJob && job.childJobs) {
          job.childJobs.forEach((child) => {
            if (invoice.selectedJobIds.has(child.id)) {
              subtotal += child.leftToInvoice;
            }
          });
          if (invoice.selectedGroupLines.has(job.id)) {
            subtotal += job.leftToInvoice;
          }
        } else {
          if (invoice.selectedJobIds.has(job.id)) {
            subtotal += job.leftToInvoice;
          }
        }
      });

      // Include custom lines in totals
      invoice.customLines.forEach((line) => {
        subtotal += line.quantity * line.unitPrice;
      });
    });

    const vatRate = 0.2;
    const vatAmount = subtotal * vatRate;
    const total = subtotal + vatAmount;

    return { subtotal, vatAmount, total };
  }, [invoices]);

  // Update invoice data
  const updateInvoice = useCallback(
    (invoiceId: string, updates: Partial<InvoiceData>) => {
      setInvoices((prev) =>
        prev.map((inv) => (inv.id === invoiceId ? { ...inv, ...updates } : inv))
      );
    },
    []
  );

  // Handle universal settings change
  const handleSettingsChange = useCallback(
    (newSettings: UniversalSettings, applyToAll: boolean = true) => {
      const previousSettings = universalSettings;
      setUniversalSettings(newSettings);

      // If contact level changed, regenerate all invoices
      if (newSettings.contactLevel !== previousSettings.contactLevel) {
        const newBreakdown = newSettings.contactLevel as BreakdownLevel;
        const newInvoices = generateInvoiceCards(
          selectedJobs,
          newBreakdown,
          newSettings.levelOfDetail
        );
        setInvoices(newInvoices);
        // Set the first invoice as active
        if (newInvoices.length > 0) {
          setActiveInvoiceId(newInvoices[0].id);
        }
        return;
      }

      // Apply settings based on applyToAll flag
      if (applyToAll) {
        // Apply to non-overridden invoices (original behavior)
        setInvoices((prev) =>
          prev.map((inv) => {
            if (!inv.isOverridden) {
              return {
                ...inv,
                levelOfDetail: newSettings.levelOfDetail,
                currency: newSettings.currency,
                bankAccount: newSettings.bankAccount,
              };
            }
            return inv;
          })
        );
      } else {
        // Apply only to the active invoice
        setInvoices((prev) =>
          prev.map((inv) => {
            if (inv.id === activeInvoiceId) {
              return {
                ...inv,
                levelOfDetail: newSettings.levelOfDetail,
                currency: newSettings.currency,
                bankAccount: newSettings.bankAccount,
                isOverridden: true,
              };
            }
            return inv;
          })
        );
      }
    },
    [universalSettings, selectedJobs, activeInvoiceId]
  );

  // Handle send all invoices
  const handleSendAll = useCallback(() => {
    const unsentIds = invoices
      .filter((inv) => !sentInvoiceIds.has(inv.id))
      .map((inv) => inv.id);

    setSentInvoiceIds((prev) => new Set([...prev, ...unsentIds]));

    // Navigate back with success message
    navigate("/group-invoicing/v2", {
      state: {
        success: true,
        message: `Successfully sent ${unsentIds.length} invoice${unsentIds.length > 1 ? "s" : ""} for ${formatCurrency(totals.total)}`,
      },
    });
  }, [invoices, sentInvoiceIds, totals.total, navigate]);

  // Handle send single invoice
  const handleSendInvoice = useCallback(
    (invoiceId: string) => {
      const invoice = invoices.find((inv) => inv.id === invoiceId);
      setSentInvoiceIds((prev) => new Set([...prev, invoiceId]));
      
      // Show toast notification
      if (invoice) {
        setToastInvoice({
          id: invoice.id,
          reference: invoice.reference || invoice.invoiceNumber.toString(),
        });
      }
      
      // Move to next unsent invoice or stay
      const unsentInvoices = invoices.filter(
        (inv) => !sentInvoiceIds.has(inv.id) && inv.id !== invoiceId
      );
      if (unsentInvoices.length > 0) {
        setActiveInvoiceId(unsentInvoices[0].id);
      }
    },
    [invoices, sentInvoiceIds]
  );

  // Handle save as draft
  const handleSaveDraft = useCallback(() => {
    setIsSaved(true);
  }, []);

  // Count unsent invoices
  const unsentCount = invoices.filter(
    (inv) => !sentInvoiceIds.has(inv.id)
  ).length;

  if (selectedJobs.length === 0) {
    navigate("/group-invoicing/v2/empty", { replace: true });
    return null;
  }

  if (!activeInvoice) {
    return (
      <div className="flex items-center justify-center min-h-[600px] bg-muted">
        <p className="text-hw-text-secondary">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-muted">
      {/* Header Bar */}
      <div className="shrink-0 h-14 bg-[var(--hw-interactive-foreground)] border-b border-hw-border px-6 flex items-center justify-between">
        {/* Left - Breadcrumbs */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium text-hw-text-secondary tracking-[-0.14px]">
              Jobs ready to invoice
            </span>
            <ChevronRight className="h-4 w-4 text-hw-text-secondary" />
            <span className="text-sm font-bold text-hw-text tracking-[-0.14px]">
              {hasSentInvoices || isSaved ? "Group Invoice 1234" : "Invoice/1234"}
            </span>
          </div>
          <div className="inline-flex items-center px-1 py-0.5 rounded-full bg-white border border-hw-border">
            <span className="text-xs font-medium text-hw-text tracking-[-0.12px] px-0.5">
              {hasSentInvoices || isSaved ? "Saved" : "Draft"}
            </span>
          </div>
        </div>

        {/* Right - Save as draft */}
        <Button
          variant="secondary"
          size="sm"
          onClick={handleSaveDraft}
        >
          {isSaved ? "Save group draft" : "Save as draft"}
        </Button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Panel - Invoice Cards */}
        <InvoiceCardList
          invoices={invoices}
          activeInvoiceId={activeInvoiceId}
          onSelectInvoice={setActiveInvoiceId}
          sentInvoiceIds={sentInvoiceIds}
          onBackClick={() => navigate("/group-invoicing/v2")}
        />

        {/* Middle/Right Panel - Live Invoice Preview */}
        <LiveInvoicePreview
          invoice={activeInvoice}
          onUpdateInvoice={(updates) => updateInvoice(activeInvoice.id, updates)}
          universalSettings={universalSettings}
          onSendInvoice={() => handleSendInvoice(activeInvoice.id)}
          isSent={sentInvoiceIds.has(activeInvoice.id)}
        />

        {/* Right Panel - Inline Settings (when flag enabled) */}
        {showInlinePanel && (
          <InlineSettingsPanel
            settings={universalSettings}
            onSettingsChange={handleSettingsChange}
            showApplyToAllCheckbox={showApplyToAllCheckbox}
          />
        )}
      </div>

      {/* Global Action Bar */}
      <GlobalActionBar
        invoiceCount={unsentCount}
        totalAmount={totals.total}
        onOpenSettings={() => setSettingsModalOpen(true)}
        onSendAll={handleSendAll}
        hasSentInvoices={hasSentInvoices}
        hideSettingsButton={showInlinePanel}
      />

      {/* Settings Modal */}
      <InvoiceSettingsModal
        open={settingsModalOpen}
        onOpenChange={setSettingsModalOpen}
        settings={universalSettings}
        onSettingsChange={handleSettingsChange}
        showApplyToAllCheckbox={showApplyToAllCheckbox}
      />

      {/* Toast Notification */}
      {toastInvoice && (
        <InvoiceSentToast
          invoiceReference={toastInvoice.reference}
          onClose={() => setToastInvoice(null)}
        />
      )}
    </div>
  );
}
