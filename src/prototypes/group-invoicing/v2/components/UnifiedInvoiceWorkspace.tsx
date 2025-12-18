import { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/registry/ui/button";
import { InvoiceCardList } from "./InvoiceCardList";
import { LiveInvoicePreview } from "./LiveInvoicePreview";
import { GlobalActionBar } from "./GlobalActionBar";
import { InvoiceSettingsModal } from "./InvoiceSettingsModal";
import { formatCurrency, type Job } from "../lib/mock-data";

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
    <div className="fixed bottom-6 left-6 z-50 flex items-start gap-3 p-4 bg-white rounded-lg shadow-[0px_0px_0px_1px_rgba(26,28,46,0.08),0px_8px_16px_0px_rgba(26,28,46,0.12)] max-w-[280px]">
      <div className="shrink-0 w-6 h-6 rounded-full bg-[#22C55E] flex items-center justify-center">
        <CheckCircle2 className="w-4 h-4 text-white" />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-sm font-bold text-[#0B2642] tracking-[-0.14px]">
          Invoice {invoiceReference} sent
        </span>
        <span className="text-sm text-[#73777D] tracking-[-0.14px]">
          This invoice has been successfully sent to the customer
        </span>
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
}

export interface UniversalSettings {
  levelOfDetail: LevelOfDetail;
  currency: string;
  bankAccount: string;
  nominalCode: string;
  departmentCode: string;
  contactLevel: string;
  tcsTextEnabled: boolean;
  rememberSelection: boolean;
}

// Helper functions
function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

function getDueDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString().split("T")[0];
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

      const jobsWithLines: JobWithLines[] = [
        {
          id: `${groupIndex}-ext-1`,
          jobRef: `JOB/1235`,
          completed: "Wed 21 May 2025",
          linesCount: 12,
          selectedLinesCount: 12,
          jobCategory: "External",
          isGroupJob: false,
          leftToInvoice: 1500,
          site: baseJob.site,
          engineerName: "Luke Brown",
        },
        {
          id: `${groupIndex}-int-1`,
          jobRef: `JOB/1235`,
          completed: "Wed 21 May 2025",
          linesCount: 12,
          selectedLinesCount: 12,
          jobCategory: "External",
          isGroupJob: false,
          leftToInvoice: 1500,
          site: baseJob.site,
          engineerName: "Luke Brown",
        },
        {
          id: `${groupIndex}-group`,
          jobRef: `G/JOB1234`,
          completed: "21 May - 3 June 2025",
          linesCount: 22,
          selectedLinesCount: 22,
          jobCategory: "External, Internal",
          isGroupJob: true,
          leftToInvoice: 3850,
          site: baseJob.site,
          childJobs: [
            {
              id: `${groupIndex}-group-child-1`,
              jobRef: `JOB/1235`,
              completed: "Wed 21 May 2025",
              linesCount: 10,
              selectedLinesCount: 0,
              leftToInvoice: 1500,
              jobCategory: "External",
              isGroupJob: false,
              engineerName: "Luke Brown",
            },
            {
              id: `${groupIndex}-group-child-2`,
              jobRef: `JOB/1236`,
              completed: "Mon 2 June 2025",
              linesCount: 12,
              selectedLinesCount: 12,
              leftToInvoice: 1500,
              jobCategory: "Internal",
              isGroupJob: false,
              engineerName: "Chris Smith",
            },
          ],
        },
      ];

      const name =
        breakdown === "contact"
          ? baseJob.parent
          : breakdown === "site"
            ? baseJob.site || baseJob.parent
            : baseJob.jobRef;

      // Initialize selected job IDs (some selected, some not for demo)
      const selectedJobIds = new Set<string>();
      const selectedGroupLines = new Set<string>();

      // Select first two standalone jobs
      selectedJobIds.add(`${groupIndex}-ext-1`);
      selectedJobIds.add(`${groupIndex}-int-1`);
      
      // For group job, only select the second child
      selectedJobIds.add(`${groupIndex}-group-child-2`);

      return {
        id: `invoice-${groupIndex}`,
        invoiceNumber: 4901 + groupIndex,
        invoiceNumberPrefix: "IV",
        name: "Next Birmingham Bullring",
        address: "Leeds, Victoria Gate, Harewood St, Leeds LS2 7AR",
        jobs: jobsWithLines,
        originalJobIds: groupJobs.map((job) => job.id),
        title: "Fire extinguisher service",
        reference: `2423452`,
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
      };
    }
  );
}

export function UnifiedInvoiceWorkspace() {
  const navigate = useNavigate();
  const location = useLocation();

  // #region agent log
  // Debug: Log layout dimensions on mount
  useEffect(() => {
    const root = document.getElementById('root');
    const main = document.querySelector('main');
    const wrapper = document.querySelector('[class*="h-full"]') || document.querySelector('[class*="h-[calc"]');
    const actionBar = document.querySelector('[class*="border-t"]');
    
    fetch('http://127.0.0.1:7242/ingest/cf7df69f-f856-4874-ac6a-b53ffb85f438',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'UnifiedInvoiceWorkspace.tsx:mount',message:'Layout after fix',data:{viewportHeight:window.innerHeight,mainHeight:main?.clientHeight,wrapperHeight:wrapper?.clientHeight,wrapperClasses:wrapper?.className,actionBarHeight:actionBar?.clientHeight,actionBarRect:actionBar?.getBoundingClientRect(),mainEqualsWrapper:main?.clientHeight===wrapper?.clientHeight},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'G,H,I'})}).catch(()=>{});
  }, []);
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

  // Universal settings state
  const [universalSettings, setUniversalSettings] = useState<UniversalSettings>(
    {
      levelOfDetail: locationState.levelOfDetail || "partial",
      currency: "gbp",
      bankAccount: "barclays",
      nominalCode: "5001",
      departmentCode: "HS49301",
      contactLevel: "HS49301",
      tcsTextEnabled: false,
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
    (newSettings: UniversalSettings) => {
      setUniversalSettings(newSettings);

      // Apply to non-overridden invoices
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
    },
    []
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
      <div className="flex items-center justify-center min-h-[600px] bg-[#FCFCFD]">
        <p className="text-[#73777D]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#F9FAFD]">
      {/* Header Bar */}
      <div className="shrink-0 h-14 bg-[#F8F9FC] border-b border-[rgba(26,28,46,0.12)] px-6 flex items-center justify-between">
        {/* Left - Breadcrumbs */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium text-[#475467] tracking-[-0.14px]">
              Jobs ready to invoice
            </span>
            <ChevronRight className="h-4 w-4 text-[#475467]" />
            <span className="text-sm font-bold text-[#101929] tracking-[-0.14px]">
              {hasSentInvoices || isSaved ? "Group Invoice 1234" : "Invoice/1234"}
            </span>
          </div>
          <div className="inline-flex items-center px-1 py-0.5 rounded-full bg-white border border-[rgba(26,28,46,0.12)]">
            <span className="text-xs font-medium text-[#0B2642] tracking-[-0.12px] px-0.5">
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

        {/* Right Panel - Live Invoice Preview */}
        <LiveInvoicePreview
          invoice={activeInvoice}
          onUpdateInvoice={(updates) => updateInvoice(activeInvoice.id, updates)}
          universalSettings={universalSettings}
          onSendInvoice={() => handleSendInvoice(activeInvoice.id)}
          isSent={sentInvoiceIds.has(activeInvoice.id)}
        />
      </div>

      {/* Global Action Bar */}
      <GlobalActionBar
        invoiceCount={unsentCount}
        totalAmount={totals.total}
        onOpenSettings={() => setSettingsModalOpen(true)}
        onSendAll={handleSendAll}
        hasSentInvoices={hasSentInvoices}
      />

      {/* Settings Modal */}
      <InvoiceSettingsModal
        open={settingsModalOpen}
        onOpenChange={setSettingsModalOpen}
        settings={universalSettings}
        onSettingsChange={handleSettingsChange}
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
