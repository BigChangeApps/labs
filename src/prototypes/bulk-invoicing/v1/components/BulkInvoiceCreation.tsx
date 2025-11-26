import { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronRight, ChevronDown, MoreVertical, HelpCircle, Check } from "lucide-react";
import { Button } from "@/registry/ui/button";
import { Checkbox } from "@/registry/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/ui/popover";
import { cn } from "@/registry/lib/utils";
import { type Job, formatCurrency } from "../lib/mock-data";

type BreakdownLevel = "contact" | "site" | "job";

interface InvoiceGroup {
  id: string;
  name: string;
  jobs: Job[];
  address: string;
  department: string;
  nominalCode: string;
  structure: BreakdownLevel;
  showLines: boolean;
}

const structureLabels: Record<BreakdownLevel, string> = {
  contact: "Contact Level",
  site: "Site Level",
  job: "Job Level",
};

const structureOptions: BreakdownLevel[] = ["contact", "site", "job"];

// Building/apartment icon for contact cards
function ApartmentIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 11V3H7V7H3V21H11V17H13V21H21V11H17ZM7 19H5V17H7V19ZM7 15H5V13H7V15ZM7 11H5V9H7V11ZM11 15H9V13H11V15ZM11 11H9V9H11V11ZM11 7H9V5H11V7ZM15 15H13V13H15V15ZM15 11H13V9H15V11ZM15 7H13V5H15V7ZM19 19H17V17H19V19ZM19 15H17V13H19V15Z" fill="#555D66"/>
    </svg>
  );
}

// Stacked layers icon for invoice groups
function StacksIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 2.5L2.5 6.25L10 10L17.5 6.25L10 2.5Z" stroke="#475467" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2.5 13.75L10 17.5L17.5 13.75" stroke="#475467" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2.5 10L10 13.75L17.5 10" stroke="#475467" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// Status badge component
function DraftBadge() {
  return (
    <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#F2F4F7] border border-[rgba(16,25,41,0.1)]">
      <span className="text-xs font-medium text-[#101929] tracking-[-0.12px]">Draft</span>
    </div>
  );
}

// Structure Select dropdown component with proper options
function StructureSelect({ 
  label, 
  value, 
  onChange, 
  showHelp = false,
  fullWidth = false,
}: { 
  label: string; 
  value: BreakdownLevel; 
  onChange: (value: BreakdownLevel) => void;
  showHelp?: boolean;
  fullWidth?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("flex flex-col gap-1.5", fullWidth ? "w-full" : "w-[328px]")}>
      <div className="flex items-center gap-1">
        <span className="text-sm font-medium text-[#0B2642] tracking-[-0.14px]">{label}</span>
        {showHelp && <HelpCircle className="h-4 w-4 text-[#73777D]" />}
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button 
            className="flex items-center justify-between w-full px-2 py-1.5 bg-white rounded-md shadow-[0px_0px_0px_1px_rgba(3,7,18,0.08),0px_0.5px_2px_0px_rgba(11,38,66,0.16)] hover:bg-gray-50 transition-colors"
          >
            <span className="text-sm font-medium text-[#0B2642] tracking-[-0.14px]">{structureLabels[value]}</span>
            <ChevronDown className="h-5 w-5 text-[#0B2642]" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-1" align="start">
          {structureOptions.map((option) => (
            <button
              key={option}
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
              className={cn(
                "w-full flex items-center justify-between px-2 py-2 text-sm rounded hover:bg-[#F8F9FC] transition-colors text-left",
                value === option ? "bg-[#F8F9FC] text-[#086DFF]" : "text-[#0B2642]"
              )}
            >
              <span>{structureLabels[option]}</span>
              {value === option && <Check className="h-4 w-4 text-[#086DFF]" />}
            </button>
          ))}
        </PopoverContent>
      </Popover>
    </div>
  );
}

// ============================================
// BULK INVOICE CARD (Multiple Parent Contacts)
// ============================================
function BulkInvoiceCard({ 
  group, 
  onStructureChange,
  onShowLinesToggle,
}: { 
  group: InvoiceGroup;
  onStructureChange: (id: string, structure: BreakdownLevel) => void;
  onShowLinesToggle: (id: string) => void;
}) {
  const total = group.jobs.reduce((sum, job) => sum + job.leftToInvoice, 0);

  return (
    <div className="bg-white rounded-lg shadow-[0px_0px_0px_1px_rgba(26,28,46,0.12),0px_1px_2px_-1px_rgba(26,28,46,0.08),0px_2px_4px_0px_rgba(26,28,46,0.06)] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-1">
          <ApartmentIcon />
          <h3 className="text-base font-bold text-[#0B2642] tracking-[-0.16px]">{group.name}</h3>
        </div>
        <button className="p-0.5 hover:bg-gray-100 rounded">
          <MoreVertical className="h-5 w-5 text-[#0B2642]" />
        </button>
      </div>

      {/* Invoice Structure Select */}
      <div className="mb-5">
        <StructureSelect 
          label="Invoice Structure" 
          value={group.structure}
          onChange={(structure) => onStructureChange(group.id, structure)}
          showHelp
        />
      </div>

      {/* Info Grid */}
      <div className="flex justify-between mb-5">
        <div className="w-[179px]">
          <p className="text-sm text-[#1A1C2E] tracking-[-0.14px]">Address</p>
          <p className="text-sm text-[#73777D] tracking-[-0.14px] mt-1">{group.address}</p>
        </div>
        <div className="w-[134px]">
          <p className="text-sm text-[#1A1C2E] tracking-[-0.14px]">Default department</p>
          <p className="text-sm text-[#73777D] tracking-[-0.14px] mt-1">{group.department}</p>
        </div>
        <div className="w-[143px]">
          <p className="text-sm text-[#1A1C2E] tracking-[-0.14px]">Default nominal code</p>
          <p className="text-sm text-[#73777D] tracking-[-0.14px] mt-1">{group.nominalCode}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-3">
        <button 
          className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-[#086DFF] bg-[#F0F6FF] hover:bg-[#E0EDFF] rounded-md transition-colors"
          onClick={() => onShowLinesToggle(group.id)}
        >
          <ChevronDown className={cn("h-4 w-4 transition-transform", group.showLines && "rotate-180")} />
          <span>Show Lines</span>
        </button>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            Preview invoice
          </Button>
          <div className="flex items-center">
            <Button 
              variant="default" 
              size="sm" 
              className="rounded-r-none pr-3"
            >
              Send invoice
            </Button>
            <button className="h-9 px-2 bg-[#086dff] hover:bg-[#0761e6] border-l border-white/20 rounded-r-md transition-colors flex items-center justify-center">
              <ChevronDown className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Lines Section */}
      {group.showLines && (
        <div className="mt-4 pt-4 border-t border-[rgba(26,28,46,0.12)]">
          <div className="space-y-2">
            {group.jobs.map((job) => (
              <div key={job.id} className="flex items-center justify-between py-2 px-3 bg-[#FCFCFD] rounded">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-[#0B2642]">{job.jobRef}</span>
                  <span className="text-sm text-[#73777D]">{job.site}</span>
                </div>
                <span className="text-sm font-medium text-[#0B2642]">{formatCurrency(job.leftToInvoice)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-2 border-t border-[rgba(26,28,46,0.12)]">
              <span className="text-sm font-bold text-[#0B2642]">Total</span>
              <span className="text-sm font-bold text-[#0B2642]">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// GROUP INVOICE CARD (Single Parent Contact)
// ============================================
function GroupInvoiceCard({ 
  group,
  dateRange,
}: { 
  group: InvoiceGroup;
  dateRange: string;
}) {
  const total = group.jobs.reduce((sum, job) => sum + job.leftToInvoice, 0);
  const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set(group.jobs.map(j => j.id)));

  const toggleJob = (jobId: string) => {
    const newSelected = new Set(selectedJobs);
    if (newSelected.has(jobId)) {
      newSelected.delete(jobId);
    } else {
      newSelected.add(jobId);
    }
    setSelectedJobs(newSelected);
  };

  return (
    <div className="bg-white rounded-lg shadow-[0px_0px_0px_1px_rgba(26,28,46,0.12),0px_1px_2px_-1px_rgba(26,28,46,0.08),0px_2px_4px_0px_rgba(26,28,46,0.06)] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-1">
          <ApartmentIcon />
          <h3 className="text-base font-bold text-[#0B2642] tracking-[-0.16px]">{group.name}</h3>
        </div>
        <button className="p-0.5 hover:bg-gray-100 rounded">
          <MoreVertical className="h-5 w-5 text-[#0B2642]" />
        </button>
      </div>

      {/* Info Grid */}
      <div className="flex justify-between mb-5">
        <div className="w-[179px]">
          <p className="text-sm text-[#1A1C2E] tracking-[-0.14px]">Address</p>
          <p className="text-sm text-[#73777D] tracking-[-0.14px] mt-1">{group.address}</p>
        </div>
        <div className="w-[134px]">
          <p className="text-sm text-[#1A1C2E] tracking-[-0.14px]">Default department</p>
          <p className="text-sm text-[#73777D] tracking-[-0.14px] mt-1">{group.department}</p>
        </div>
        <div className="w-[143px]">
          <p className="text-sm text-[#1A1C2E] tracking-[-0.14px]">Default nominal code</p>
          <p className="text-sm text-[#73777D] tracking-[-0.14px] mt-1">{group.nominalCode}</p>
        </div>
      </div>

      {/* Invoice Summary Row */}
      <div className="bg-[#FCFCFD] rounded-lg border border-[rgba(26,28,46,0.08)] p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <StacksIcon />
            <span className="text-sm font-medium text-[#086DFF]">{group.jobs.length} invoice{group.jobs.length !== 1 ? 's' : ''}</span>
            <span className="text-sm text-[#73777D]">{dateRange}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[#0B2642]">{formatCurrency(total)}</span>
            <button className="p-0.5 hover:bg-gray-100 rounded">
              <MoreVertical className="h-4 w-4 text-[#475467]" />
            </button>
          </div>
        </div>

        {/* Job Lines */}
        <div className="space-y-2">
          {group.jobs.map((job) => {
            const isSelected = selectedJobs.has(job.id);
            return (
              <div 
                key={job.id} 
                className={cn(
                  "flex items-center justify-between py-2 px-3 rounded-md border transition-colors",
                  isSelected 
                    ? "bg-[#f0f6ff] border-[rgba(8,109,255,0.2)]" 
                    : "bg-white border-[rgba(26,28,46,0.08)]"
                )}
              >
                <div className="flex items-center gap-3">
                  <Checkbox 
                    checked={isSelected}
                    onCheckedChange={() => toggleJob(job.id)}
                  />
                  <div>
                    <p className="text-sm font-medium text-[#0B2642]">{job.site}</p>
                    <p className="text-xs text-[#73777D]">{group.jobs.length} lines</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-[#0B2642]">{formatCurrency(job.leftToInvoice)}</span>
                  <Button variant="outline" size="sm" className="h-8">
                    Preview
                  </Button>
                  <Button variant="default" size="sm" className="h-8">
                    Send
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================
// OVERVIEW PANELS
// ============================================

// Overview panel for Bulk Invoice (multiple parents)
function BulkOverviewPanel({ 
  invoiceId,
  invoiceCount, 
  structureLabel, 
  total,
  onSend,
  universalStructure,
  onStructureChange,
}: { 
  invoiceId: string;
  invoiceCount: number;
  structureLabel: string;
  total: number;
  onSend: () => void;
  universalStructure: BreakdownLevel;
  onStructureChange: (structure: BreakdownLevel) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Universal Structure Card */}
      <div className="bg-white rounded-lg shadow-[0px_0px_0px_1px_rgba(11,38,66,0.08),0px_1px_2px_-1px_rgba(11,38,66,0.08),0px_2px_4px_0px_rgba(11,38,66,0.04)] overflow-hidden">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-bold text-[#0B2642] tracking-[-0.14px]">Bulk Invoice</span>
            <div className="flex items-center gap-1">
              <DraftBadge />
              <button className="p-0.5 hover:bg-gray-100 rounded">
                <MoreVertical className="h-5 w-5 text-[#0B2642]" />
              </button>
            </div>
          </div>
          <p className="text-sm font-medium text-[#73777D] tracking-[-0.14px]">{invoiceId}</p>
        </div>
        <div className="px-4 pb-4">
          <StructureSelect 
            label="Invoice Structure" 
            value={universalStructure}
            onChange={onStructureChange}
            showHelp
            fullWidth
          />
        </div>
      </div>

      {/* Overview Panel */}
      <div className="bg-white rounded-lg shadow-[0px_0px_0px_1px_rgba(26,28,46,0.12),0px_1px_2px_-1px_rgba(26,28,46,0.08),0px_2px_4px_0px_rgba(26,28,46,0.06)] overflow-hidden">
        <div className="px-5 pt-5 pb-4">
          <h2 className="text-xl font-extrabold text-[#0B2642] tracking-[-0.2px]" style={{ fontFamily: "'Roboto Flex', sans-serif" }}>
            Overview
          </h2>
          <p className="text-sm font-medium text-[#73777D] tracking-[-0.14px] mt-1">
            {invoiceId}
          </p>
        </div>
        <div className="h-px bg-[#E5E7EB]" />
        <div className="px-5 py-4">
          <div className="space-y-1">
            <p className="text-sm text-[#73777D] tracking-[-0.14px]">
              {invoiceCount} Invoice{invoiceCount !== 1 ? 's' : ''} will be sent
            </p>
            <p className="text-sm text-[#73777D] tracking-[-0.14px]">
              Using {structureLabel.toLowerCase()} structure
            </p>
          </div>
        </div>
        <div className="bg-[#F8F9FC] border-t border-[rgba(26,28,46,0.12)] px-5 py-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-[#0B2642] tracking-[-0.14px]">Bulk Invoice total</span>
            <span className="text-base font-bold text-[#0B2642] tracking-[-0.16px]">{formatCurrency(total)}</span>
          </div>
          <Button 
            variant="default" 
            size="default" 
            className="w-full"
            onClick={onSend}
          >
            Send All Invoices
          </Button>
        </div>
      </div>
    </div>
  );
}

// Overview panel for Group Invoice (single parent)
function GroupOverviewPanel({ 
  invoiceId,
  invoiceCount, 
  structureLabel, 
  total,
  onSend,
  universalStructure,
  onStructureChange,
}: { 
  invoiceId: string;
  invoiceCount: number;
  structureLabel: string;
  total: number;
  onSend: () => void;
  universalStructure: BreakdownLevel;
  onStructureChange: (structure: BreakdownLevel) => void;
}) {
  return (
    <div className="bg-white rounded-lg shadow-[0px_0px_0px_1px_rgba(26,28,46,0.12),0px_1px_2px_-1px_rgba(26,28,46,0.08),0px_2px_4px_0px_rgba(26,28,46,0.06)] overflow-hidden">
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-[#0B2642] tracking-[-0.2px]" style={{ fontFamily: "'Roboto Flex', sans-serif" }}>
            Overview
          </h2>
          <div className="flex items-center gap-1">
            <DraftBadge />
            <button className="p-0.5 hover:bg-gray-100 rounded">
              <MoreVertical className="h-5 w-5 text-[#0B2642]" />
            </button>
          </div>
        </div>
        <p className="text-sm font-medium text-[#73777D] tracking-[-0.14px] mt-1">
          {invoiceId}
        </p>
      </div>

      <div className="px-5 pb-4">
        <StructureSelect 
          label="Invoice Structure" 
          value={universalStructure}
          onChange={onStructureChange}
          showHelp
          fullWidth
        />
      </div>

      <div className="h-px bg-[#E5E7EB]" />

      <div className="px-5 py-4">
        <div className="space-y-1">
          <p className="text-sm text-[#73777D] tracking-[-0.14px]">
            {invoiceCount} Invoice{invoiceCount !== 1 ? 's' : ''} will be sent
          </p>
          <p className="text-sm text-[#73777D] tracking-[-0.14px]">
            Using {structureLabel.toLowerCase()} structure
          </p>
        </div>
      </div>

      <div className="bg-[#F8F9FC] border-t border-[rgba(26,28,46,0.12)] px-5 py-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-[#0B2642] tracking-[-0.14px]">Invoice Total</span>
          <span className="text-base font-bold text-[#0B2642] tracking-[-0.16px]">{formatCurrency(total)}</span>
        </div>
        <Button 
          variant="default" 
          size="default" 
          className="w-full"
          onClick={onSend}
        >
          Send Invoice
        </Button>
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================
export function BulkInvoiceCreation() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get data from navigation state
  const { selectedJobs = [], breakdownLevel = "contact" as BreakdownLevel } = (location.state || {}) as { 
    selectedJobs?: Job[]; 
    breakdownLevel?: BreakdownLevel;
  };

  // Determine if this is a Group Invoice (single parent) or Bulk Invoice (multiple parents)
  const uniqueParents = useMemo(() => {
    return [...new Set(selectedJobs.map(job => job.parent))];
  }, [selectedJobs]);

  const isGroupInvoice = uniqueParents.length === 1;

  const [universalStructure, setUniversalStructure] = useState<BreakdownLevel>(breakdownLevel);
  const [invoiceGroups, setInvoiceGroups] = useState<InvoiceGroup[]>(() => {
    // Group jobs by parent contact
    const groupedByParent = selectedJobs.reduce((acc, job) => {
      if (!acc[job.parent]) {
        acc[job.parent] = [];
      }
      acc[job.parent].push(job);
      return acc;
    }, {} as Record<string, Job[]>);

    // Create invoice groups
    return Object.entries(groupedByParent).map(([parent, jobs], index) => ({
      id: `group-${index}`,
      name: parent,
      jobs,
      address: "1 Drummond Gate, Pimlico, London, SW1V 2QQ",
      department: "HS/49301",
      nominalCode: "5001",
      structure: breakdownLevel,
      showLines: false,
    }));
  });

  // Generate a unique invoice ID
  const invoiceId = useMemo(() => {
    const prefix = isGroupInvoice ? "Bulk Invoice" : "Bulk Invoice";
    return `${prefix} - ${Math.floor(1000 + Math.random() * 9000)}`;
  }, [isGroupInvoice]);

  // Calculate date range from jobs
  const dateRange = useMemo(() => {
    // Simple date range for demo
    return "21 May – 3 June 2025";
  }, []);

  // Calculate totals based on structure
  const summary = useMemo(() => {
    const total = selectedJobs.reduce((sum, job) => sum + job.leftToInvoice, 0);
    
    // Invoice count depends on structure level
    let invoiceCount: number;
    switch (universalStructure) {
      case "contact":
        invoiceCount = invoiceGroups.length;
        break;
      case "site":
        invoiceCount = new Set(selectedJobs.map(job => job.site)).size;
        break;
      case "job":
        invoiceCount = selectedJobs.length;
        break;
      default:
        invoiceCount = invoiceGroups.length;
    }
    
    return { total, invoiceCount };
  }, [selectedJobs, invoiceGroups.length, universalStructure]);

  const handleStructureChange = (groupId: string, structure: BreakdownLevel) => {
    setInvoiceGroups(groups => 
      groups.map(g => g.id === groupId ? { ...g, structure } : g)
    );
  };

  const handleUniversalStructureChange = (structure: BreakdownLevel) => {
    setUniversalStructure(structure);
    // Update all groups to match
    setInvoiceGroups(groups => 
      groups.map(g => ({ ...g, structure }))
    );
  };

  const handleShowLinesToggle = (groupId: string) => {
    setInvoiceGroups(groups => 
      groups.map(g => g.id === groupId ? { ...g, showLines: !g.showLines } : g)
    );
  };

  const handleSendApplication = () => {
    // Show success and navigate back
    navigate("/bulk-invoicing", { 
      state: { 
        success: true, 
        message: `Successfully created ${summary.invoiceCount} invoice${summary.invoiceCount !== 1 ? 's' : ''} totaling ${formatCurrency(summary.total)}` 
      } 
    });
  };

  // If no jobs selected, redirect back
  if (selectedJobs.length === 0) {
    return (
      <div className="min-h-screen bg-[#FCFCFD] flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-[#73777D] mb-4">No jobs selected for invoicing</p>
          <Button variant="default" onClick={() => navigate("/bulk-invoicing")}>
            Go back to Jobs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFCFD]">
      {/* Subheader */}
      <header className="sticky top-0 z-10 bg-white border-b border-[rgba(16,25,41,0.1)]">
        <div className="flex items-center justify-between px-6 py-3">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <button 
                onClick={() => navigate("/bulk-invoicing")}
                className="text-sm font-medium text-[#475467] hover:text-[#0B2642] tracking-[-0.14px]"
              >
                Jobs ready to invoice
              </button>
              <ChevronRight className="h-4 w-4 text-[#475467]" />
              <span className="text-sm font-bold text-[#101929] tracking-[-0.14px]">{invoiceId}</span>
            </div>
            <DraftBadge />
          </div>

          {/* Actions */}
          <Button variant="outline" size="sm">
            Save as draft
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 lg:px-[160px] py-6">
        <div className="flex gap-6 max-w-[1104px] mx-auto">
          {/* Left Column - Invoice Cards */}
          <div className="flex-1 space-y-6 max-w-[700px]">
            {isGroupInvoice ? (
              // GROUP INVOICE VIEW - Single parent, detailed view
              invoiceGroups.map((group) => (
                <GroupInvoiceCard
                  key={group.id}
                  group={group}
                  dateRange={dateRange}
                />
              ))
            ) : (
              // BULK INVOICE VIEW - Multiple parents, each with structure selector
              invoiceGroups.map((group) => (
                <BulkInvoiceCard
                  key={group.id}
                  group={group}
                  onStructureChange={handleStructureChange}
                  onShowLinesToggle={handleShowLinesToggle}
                />
              ))
            )}
          </div>

          {/* Right Column - Overview */}
          <div className="w-[380px]">
            {isGroupInvoice ? (
              <GroupOverviewPanel
                invoiceId={invoiceId}
                invoiceCount={summary.invoiceCount}
                structureLabel={structureLabels[universalStructure]}
                total={summary.total}
                onSend={handleSendApplication}
                universalStructure={universalStructure}
                onStructureChange={handleUniversalStructureChange}
              />
            ) : (
              <BulkOverviewPanel
                invoiceId={invoiceId}
                invoiceCount={summary.invoiceCount}
                structureLabel={structureLabels[universalStructure]}
                total={summary.total}
                onSend={handleSendApplication}
                universalStructure={universalStructure}
                onStructureChange={handleUniversalStructureChange}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
