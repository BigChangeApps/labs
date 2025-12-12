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

interface SiteInvoice {
  id: string;
  siteName: string;
  address: string;
  department: string;
  nominalCode: string;
  jobs: JobWithLines[];
}

interface JobWithLines extends Job {
  linesCount: number;
  selectedLinesCount: number;
  jobCategory: "External" | "Internal" | "External, Internal";
  isGroupJob: boolean;
  childJobs?: JobWithLines[];
}

const structureLabels: Record<BreakdownLevel, string> = {
  contact: "Contact Level",
  site: "Site Level",
  job: "Job Level",
};

const structureOptions: BreakdownLevel[] = ["contact", "site", "job"];

// File/Document icon for site headers
function FileTextIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9.33333 1.33333H4C3.64638 1.33333 3.30724 1.47381 3.05719 1.72386C2.80714 1.97391 2.66667 2.31304 2.66667 2.66667V13.3333C2.66667 13.687 2.80714 14.0261 3.05719 14.2761C3.30724 14.5262 3.64638 14.6667 4 14.6667H12C12.3536 14.6667 12.6928 14.5262 12.9428 14.2761C13.1929 14.0261 13.3333 13.687 13.3333 13.3333V5.33333L9.33333 1.33333Z" stroke="#73777D" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9.33333 1.33333V5.33333H13.3333" stroke="#73777D" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// Stacked layers icon for group jobs
function StacksIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 2.5L2.5 6.25L10 10L17.5 6.25L10 2.5Z" stroke="#475467" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2.5 13.75L10 17.5L17.5 13.75" stroke="#475467" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2.5 10L10 13.75L17.5 10" stroke="#475467" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// Status badge component - white background
function DraftBadge() {
  return (
    <div className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-white border border-[rgba(16,25,41,0.1)]">
      <span className="text-xs font-medium text-[#0B2642] tracking-[-0.12px]">Draft</span>
    </div>
  );
}

// Split button component matching Figma design
function SplitButton({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <div className="flex items-start rounded-[var(--hw-radius-button,0.375rem)] shadow-[0_0_0_1px_rgba(7,98,229,0.8)] overflow-hidden">
      <Button 
        variant="default"
        size="sm"
        className="rounded-r-none"
        onClick={onClick}
      >
        {label}
      </Button>
      <Button 
        variant="default"
        size="sm"
        className="rounded-l-none border-l border-white/20 px-1"
      >
        <ChevronDown className="h-5 w-5" />
      </Button>
    </div>
  );
}

// Resource avatar component
function ResourceAvatar({ initials = "LB" }: { initials?: string }) {
  return (
    <div className="relative size-[18px]">
      <div className="absolute inset-0 rounded-full bg-white shadow-[0px_0px_0px_1px_rgba(3,7,18,0.08),0px_0.45px_1.8px_0px_rgba(11,38,66,0.16)] overflow-hidden">
        <div className="absolute inset-[5%] rounded-full bg-[#F8F9FC] flex items-center justify-center">
          <span className="text-[8px] font-semibold text-[#73777D] leading-none">{initials}</span>
        </div>
      </div>
    </div>
  );
}

// Lines selection badge
function LinesBadge({ 
  total, 
  selected, 
  isPartial = false 
}: { 
  total: number; 
  selected?: number; 
  isPartial?: boolean;
}) {
  if (isPartial && selected !== undefined) {
    return (
      <div className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-[rgba(8,109,255,0.08)] border border-[rgba(2,136,209,0.2)] w-fit">
        <span className="text-sm font-medium text-[#0288d1] tracking-[-0.14px]">{selected} of {total} lines</span>
      </div>
    );
  }
  return (
    <div className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-white border border-[rgba(26,28,46,0.12)] w-fit">
      <span className="text-sm font-medium text-[#73777D] tracking-[-0.14px]">{total} lines</span>
    </div>
  );
}

// Job type badge
function JobTypeBadge({ type }: { type: string }) {
  return (
    <div className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-white border border-[rgba(26,28,46,0.12)]">
      <span className="text-sm font-medium text-[#73777D] tracking-[-0.14px]">{type}</span>
    </div>
  );
}

// Structure Select dropdown
function StructureSelect({ 
  label, 
  value, 
  onChange, 
  showHelp = false,
}: { 
  label: string; 
  value: BreakdownLevel; 
  onChange: (value: BreakdownLevel) => void;
  showHelp?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-1.5 w-full">
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

// Single job card (non-group)
function JobCard({ 
  job,
  showOptions = true,
}: { 
  job: JobWithLines;
  showOptions?: boolean;
}) {
  const isPartial = job.selectedLinesCount > 0 && job.selectedLinesCount < job.linesCount;
  
  return (
    <div className="bg-white rounded-lg border border-[rgba(26,28,46,0.12)] overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex-1 flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-[#0B2642] tracking-[-0.14px]">{job.jobRef}</span>
            <span className="text-sm font-medium text-[#73777D] tracking-[-0.14px]">{job.completed}</span>
            <ResourceAvatar />
          </div>
          <LinesBadge 
            total={job.linesCount} 
            selected={isPartial ? job.selectedLinesCount : undefined}
            isPartial={isPartial}
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-[#0B2642] tracking-[-0.14px]">{formatCurrency(job.leftToInvoice)}</span>
          {showOptions && (
            <button className="p-0.5 hover:bg-gray-100 rounded">
              <MoreVertical className="h-5 w-5 text-[#0B2642]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Nested job card with checkbox (for group jobs)
function NestedJobCard({ 
  job,
  checked,
  onCheckedChange,
}: { 
  job: JobWithLines;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  const isPartial = job.selectedLinesCount > 0 && job.selectedLinesCount < job.linesCount;
  
  return (
    <div className="bg-white rounded-lg border border-[rgba(26,28,46,0.12)] overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3">
        <Checkbox 
          checked={checked}
          onCheckedChange={onCheckedChange}
        />
        <div className="flex-1 flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-[#0B2642] tracking-[-0.14px]">{job.jobRef}</span>
            <span className="text-sm font-medium text-[#73777D] tracking-[-0.14px]">{job.completed}</span>
            <ResourceAvatar />
          </div>
          <div className="flex items-center gap-2">
            <LinesBadge 
              total={job.linesCount} 
              selected={isPartial ? job.selectedLinesCount : undefined}
              isPartial={isPartial}
            />
            {job.jobCategory !== "External, Internal" && (
              <JobTypeBadge type={job.jobCategory} />
            )}
          </div>
        </div>
        <span className={cn(
          "text-sm font-bold tracking-[-0.14px]",
          checked ? "text-[#0B2642]" : "text-[rgba(11,38,66,0.4)] line-through"
        )}>
          {formatCurrency(job.leftToInvoice)}
        </span>
      </div>
    </div>
  );
}

// Group job card (collapsible with nested jobs)
function GroupJobCard({ 
  groupJob,
  childJobs,
  selectedChildIds,
  onChildSelectionChange,
  groupLinesSelected,
  onGroupLinesSelectionChange,
}: { 
  groupJob: JobWithLines;
  childJobs: JobWithLines[];
  selectedChildIds: Set<string>;
  onChildSelectionChange: (jobId: string, checked: boolean) => void;
  groupLinesSelected: boolean;
  onGroupLinesSelectionChange: (checked: boolean) => void;
}) {
  // Calculate total value including group-level lines if selected
  const childJobsValue = childJobs.reduce((sum, job) => 
    selectedChildIds.has(job.id) ? sum + job.leftToInvoice : sum, 0
  );
  const groupLinesValue = 850;
  const totalValue = childJobsValue + (groupLinesSelected ? groupLinesValue : 0);

  // Calculate date range from child jobs
  const dateRange = "21 May - 3 June 2025";

  return (
    <div className="bg-white rounded-lg border border-[rgba(26,28,46,0.12)] overflow-hidden">
      {/* Header */}
      <div className="bg-[#F8F9FC] border-b border-[rgba(26,28,46,0.12)] px-3 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StacksIcon />
            <span className="text-sm font-bold text-[#0B2642] tracking-[-0.14px]">{groupJob.jobRef}</span>
            <span className="text-sm font-medium text-[#73777D] tracking-[-0.14px]">{dateRange}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-[#0B2642] tracking-[-0.14px]">{formatCurrency(totalValue)}</span>
            <button className="p-0.5 hover:bg-white/50 rounded">
              <MoreVertical className="h-5 w-5 text-[#0B2642]" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Nested job cards */}
      <div className="p-4 space-y-3">
        {/* Group-level lines card */}
        <div className="bg-white rounded-lg border border-[rgba(26,28,46,0.12)] overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3">
            <Checkbox 
              checked={groupLinesSelected}
              onCheckedChange={onGroupLinesSelectionChange}
            />
            <div className="flex-1 flex flex-col gap-1.5">
              <span className="text-sm font-bold text-[#0B2642] tracking-[-0.14px]">Group-level lines</span>
              <LinesBadge total={10} />
            </div>
            <span className={cn(
              "text-sm font-bold tracking-[-0.14px]",
              groupLinesSelected ? "text-[#0B2642]" : "text-[rgba(11,38,66,0.4)] line-through"
            )}>
              {formatCurrency(groupLinesValue)}
            </span>
          </div>
        </div>
        
        {/* Child jobs */}
        {childJobs.map((childJob) => (
          <NestedJobCard
            key={childJob.id}
            job={childJob}
            checked={selectedChildIds.has(childJob.id)}
            onCheckedChange={(checked) => onChildSelectionChange(childJob.id, checked as boolean)}
          />
        ))}
      </div>
    </div>
  );
}

// Site Invoice Card
function SiteInvoiceCard({ 
  siteInvoice,
  selectedJobIds,
  selectedGroupLines,
  onJobSelectionChange,
  onGroupLinesSelectionChange,
}: { 
  siteInvoice: SiteInvoice;
  selectedJobIds: Set<string>;
  selectedGroupLines: Set<string>;
  onJobSelectionChange: (jobId: string, checked: boolean) => void;
  onGroupLinesSelectionChange: (groupJobId: string, checked: boolean) => void;
}) {
  // Group jobs by category
  const jobsByCategory = useMemo(() => {
    const groups: Record<string, JobWithLines[]> = {
      "External": [],
      "Internal": [],
      "External, Internal": [],
    };
    
    siteInvoice.jobs.forEach(job => {
      if (groups[job.jobCategory]) {
        groups[job.jobCategory].push(job);
      }
    });
    
    return groups;
  }, [siteInvoice.jobs]);

  // Calculate totals including group-level lines
  const subtotal = useMemo(() => {
    let total = 0;
    siteInvoice.jobs.forEach(job => {
      if (job.isGroupJob && job.childJobs) {
        // Add group-level lines value if selected
        if (selectedGroupLines.has(job.id)) {
          total += 850; // Group-level lines value
        }
        // Add selected child jobs
        job.childJobs.forEach(child => {
          if (selectedJobIds.has(child.id)) {
            total += child.leftToInvoice;
          }
        });
      } else {
        // Single jobs are always included
        total += job.leftToInvoice;
      }
    });
    return total;
  }, [siteInvoice.jobs, selectedJobIds, selectedGroupLines]);
  
  const vatRate = 0.10;
  const total = subtotal * (1 + vatRate);

  return (
    <div className="bg-white rounded-lg shadow-[0px_0px_0px_1px_rgba(26,28,46,0.12),0px_1px_2px_-1px_rgba(26,28,46,0.08),0px_2px_4px_0px_rgba(26,28,46,0.06)] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1">
          <FileTextIcon />
          <h3 className="text-base font-bold text-[#0B2642] tracking-[-0.16px]">{siteInvoice.siteName}</h3>
        </div>
        <button className="p-0.5 hover:bg-gray-100 rounded">
          <MoreVertical className="h-5 w-5 text-[#0B2642]" />
        </button>
      </div>

      {/* Info Grid */}
      <div className="flex justify-between mb-6">
        <div className="w-[179px]">
          <p className="text-sm font-normal text-[#1A1C2E] tracking-[-0.14px]">Address</p>
          <p className="text-sm font-normal text-[#73777D] tracking-[-0.14px] mt-1">{siteInvoice.address}</p>
        </div>
        <div className="w-[134px]">
          <p className="text-sm font-normal text-[#1A1C2E] tracking-[-0.14px]">Default department</p>
          <p className="text-sm font-normal text-[#73777D] tracking-[-0.14px] mt-1">{siteInvoice.department}</p>
        </div>
        <div className="w-[143px]">
          <p className="text-sm font-normal text-[#1A1C2E] tracking-[-0.14px]">Default nominal code</p>
          <p className="text-sm font-normal text-[#73777D] tracking-[-0.14px] mt-1">{siteInvoice.nominalCode}</p>
        </div>
      </div>

      {/* Jobs by category */}
      <div className="space-y-6 mb-6">
        {Object.entries(jobsByCategory).map(([category, jobs]) => {
          if (jobs.length === 0) return null;
          
          return (
            <div key={category} className="space-y-2">
              <p className="text-sm font-medium text-[#73777D] tracking-[-0.14px]">{category}</p>
              {jobs.map(job => {
                if (job.isGroupJob && job.childJobs) {
                  return (
                    <GroupJobCard
                      key={job.id}
                      groupJob={job}
                      childJobs={job.childJobs}
                      selectedChildIds={selectedJobIds}
                      onChildSelectionChange={onJobSelectionChange}
                      groupLinesSelected={selectedGroupLines.has(job.id)}
                      onGroupLinesSelectionChange={(checked) => onGroupLinesSelectionChange(job.id, checked as boolean)}
                    />
                  );
                }
                return <JobCard key={job.id} job={job} />;
              })}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="bg-[#F8F9FC] rounded-lg p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#0B2642] tracking-[-0.14px]">Sub-total</span>
            <span className="text-sm font-medium text-[#0B2642] tracking-[-0.14px]">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#0B2642] tracking-[-0.14px]">Total VAT</span>
            <span className="text-sm font-medium text-[#0B2642] tracking-[-0.14px]">10%</span>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-[rgba(26,28,46,0.12)]">
            <span className="text-base font-bold text-[#0B2642] tracking-[-0.16px]">Total</span>
            <span className="text-base font-bold text-[#0B2642] tracking-[-0.16px]">{formatCurrency(total)}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-end gap-3 mt-4">
          <Button variant="outline" size="sm">
            Preview invoice
          </Button>
          <SplitButton label="Send invoice" />
        </div>
      </div>
    </div>
  );
}

// Overview Panel
function OverviewPanel({ 
  invoiceId,
  invoiceCount, 
  structureLabel, 
  subtotal,
  total,
  onSend,
  universalStructure,
  onStructureChange,
}: { 
  invoiceId: string;
  invoiceCount: number;
  structureLabel: string;
  subtotal: number;
  total: number;
  onSend: () => void;
  universalStructure: BreakdownLevel;
  onStructureChange: (structure: BreakdownLevel) => void;
}) {
  return (
    <div className="bg-white rounded-lg shadow-[0px_0px_0px_1px_rgba(3,7,18,0.08),0px_0.5px_2px_0px_rgba(11,38,66,0.16)] overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-6 pb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-base font-bold text-[#0B2642] tracking-[-0.16px]">Overview</span>
          <div className="flex items-center gap-1">
            <DraftBadge />
            <button className="p-0.5 hover:bg-gray-100 rounded">
              <MoreVertical className="h-5 w-5 text-[#0B2642]" />
            </button>
          </div>
        </div>
        <p className="text-sm font-medium text-[#73777D] tracking-[-0.14px]">{invoiceId}</p>
      </div>
      
      {/* Invoice Structure */}
      <div className="px-4 pb-4">
        <StructureSelect 
          label="Invoice Structure" 
          value={universalStructure}
          onChange={onStructureChange}
          showHelp
        />
      </div>
      
      {/* Divider */}
      <div className="border-t border-[rgba(26,28,46,0.12)] px-5 py-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-[#73777D] tracking-[-0.14px]">
            {invoiceCount} Invoice{invoiceCount !== 1 ? 's' : ''} will be sent
          </p>
          <p className="text-sm font-medium text-[#73777D] tracking-[-0.14px]">
            Using {structureLabel.toLowerCase()} structure
          </p>
        </div>
      </div>
      
      {/* Summary */}
      <div className="bg-[#F8F9FC] border-t border-[rgba(26,28,46,0.12)] px-5 py-4 space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-normal text-[#0B2642] tracking-[-0.14px]">Sub-total</span>
            <span className="text-sm font-normal text-[#0B2642] tracking-[-0.14px]">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-normal text-[#0B2642] tracking-[-0.14px]">Total VAT</span>
            <span className="text-sm font-normal text-[#0B2642] tracking-[-0.14px]">10%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-[#0B2642] tracking-[-0.16px]">Group Invoice Total</span>
            <span className="text-base font-bold text-[#0B2642] tracking-[-0.16px]">{formatCurrency(total)}</span>
          </div>
        </div>
        
        <Button 
          variant="default" 
          size="default" 
          className="w-full"
          onClick={onSend}
        >
          Send Invoices
        </Button>
      </div>
    </div>
  );
}

// Main component
export function GroupInvoiceView() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get data from navigation state
  const { selectedJobs = [], breakdownLevel = "site" as BreakdownLevel } = (location.state || {}) as { 
    selectedJobs?: Job[]; 
    breakdownLevel?: BreakdownLevel;
  };

  const [universalStructure, setUniversalStructure] = useState<BreakdownLevel>(breakdownLevel);
  const [selectedJobIds, setSelectedJobIds] = useState<Set<string>>(() => {
    // Initialize with all jobs selected
    return new Set(selectedJobs.map(j => j.id));
  });
  const [selectedGroupLines, setSelectedGroupLines] = useState<Set<string>>(() => {
    // Initialize with all group lines selected
    return new Set(selectedJobs.map(j => j.id));
  });

  // Generate invoice ID
  const invoiceId = useMemo(() => {
    return `Invoice - ${Math.floor(1000 + Math.random() * 9000)}`;
  }, []);

  // Transform jobs into site-based invoices
  const siteInvoices: SiteInvoice[] = useMemo(() => {
    // Group jobs by site
    const jobsBySite = selectedJobs.reduce((acc, job) => {
      if (!acc[job.site]) {
        acc[job.site] = [];
      }
      acc[job.site].push(job);
      return acc;
    }, {} as Record<string, Job[]>);

    // Create site invoices with deterministic mock data
    return Object.entries(jobsBySite).map(([site, jobs], siteIndex): SiteInvoice => {
      // Add mock data to jobs
      const jobsWithLines: JobWithLines[] = jobs.map((job, jobIndex) => {
        // Use deterministic values based on job id for consistency
        const seed = parseInt(job.id) || jobIndex;
        const linesCount = 20 + (seed % 10);
        const selectedLinesCount = seed % 3 === 0 ? linesCount : Math.floor(linesCount * 0.66);
        
        // Make every 3rd job a group job (for jobs with multiple types)
        const isGroupJob = jobIndex % 3 === 2;
        
        // Determine job category - alternate between External and Internal for single jobs
        let jobCategory: "External" | "Internal" | "External, Internal";
        if (isGroupJob) {
          jobCategory = "External, Internal";
        } else if (jobIndex % 2 === 0) {
          jobCategory = "External";
        } else {
          jobCategory = "Internal";
        }

        const jobWithLines: JobWithLines = {
          ...job,
          jobRef: isGroupJob ? `G/JOB${job.jobRef.slice(-4)}` : (jobIndex % 2 === 0 ? `EXT/${job.jobRef}` : `INT/${job.jobRef}`),
          linesCount,
          selectedLinesCount,
          jobCategory,
          isGroupJob,
        };

        // Add child jobs for group jobs
        if (isGroupJob) {
          const baseValue = job.leftToInvoice;
          jobWithLines.childJobs = [
            {
              ...job,
              id: `${job.id}-child-1`,
              jobRef: `JOB/${1235 + siteIndex}`,
              completed: "Wed 21 May 2025",
              linesCount: 12,
              selectedLinesCount: 10,
              leftToInvoice: baseValue * 0.39,
              jobCategory: "External",
              isGroupJob: false,
            },
            {
              ...job,
              id: `${job.id}-child-2`,
              jobRef: `JOB/${1236 + siteIndex}`,
              completed: "Mon 2 June 2025",
              linesCount: 12,
              selectedLinesCount: 10,
              leftToInvoice: baseValue * 0.39,
              jobCategory: "Internal",
              isGroupJob: false,
            },
            {
              ...job,
              id: `${job.id}-child-3`,
              jobRef: `JOB/${1237 + siteIndex}`,
              completed: "Tue 3 June 2025",
              linesCount: 25,
              selectedLinesCount: 0,
              leftToInvoice: baseValue * 0.22,
              jobCategory: "Internal",
              isGroupJob: false,
            },
          ];
          // Group-level lines value
          jobWithLines.leftToInvoice = 850;
        }

        return jobWithLines;
      });

      // Extract city from site name for address
      const siteParts = site.split(' ');
      const city = siteParts[siteParts.length - 1];

      return {
        id: `site-${siteIndex}`,
        siteName: site,
        address: `Market Street, ${city}, M124 2FY`,
        department: "HS/49301",
        nominalCode: "5001",
        jobs: jobsWithLines,
      };
    });
  }, [selectedJobs]);

  // Calculate totals
  const summary = useMemo(() => {
    let subtotal = 0;
    siteInvoices.forEach(site => {
      site.jobs.forEach(job => {
        if (job.isGroupJob && job.childJobs) {
          // Add group-level lines value if selected
          if (selectedGroupLines.has(job.id)) {
            subtotal += 850; // Group-level lines value
          }
          // Add selected child jobs
          job.childJobs.forEach(child => {
            if (selectedJobIds.has(child.id)) {
              subtotal += child.leftToInvoice;
            }
          });
        } else {
          // Single jobs are always included
          subtotal += job.leftToInvoice;
        }
      });
    });
    
    const vatRate = 0.10;
    const total = subtotal * (1 + vatRate);
    
    return { subtotal, total, invoiceCount: siteInvoices.length };
  }, [siteInvoices, selectedJobIds, selectedGroupLines]);

  const handleJobSelectionChange = (jobId: string, checked: boolean) => {
    const newSelected = new Set(selectedJobIds);
    if (checked) {
      newSelected.add(jobId);
    } else {
      newSelected.delete(jobId);
    }
    setSelectedJobIds(newSelected);
  };

  const handleGroupLinesSelectionChange = (groupJobId: string, checked: boolean) => {
    const newSelected = new Set(selectedGroupLines);
    if (checked) {
      newSelected.add(groupJobId);
    } else {
      newSelected.delete(groupJobId);
    }
    setSelectedGroupLines(newSelected);
  };

  const handleSendInvoices = () => {
    navigate("/bulk-invoicing/v1", { 
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
          <Button variant="default" onClick={() => navigate("/bulk-invoicing/v1")}>
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
                onClick={() => navigate("/bulk-invoicing/v1")}
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
          <Button variant="outline" size="sm" className="bg-white">
            Save as draft
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 lg:px-20 py-6">
        <div className="flex gap-6 max-w-[1104px] mx-auto">
          {/* Left Column - Site Invoice Cards */}
          <div className="flex-1 space-y-6 max-w-[700px]">
            {siteInvoices.map((siteInvoice) => (
              <SiteInvoiceCard
                key={siteInvoice.id}
                siteInvoice={siteInvoice}
                selectedJobIds={selectedJobIds}
                selectedGroupLines={selectedGroupLines}
                onJobSelectionChange={handleJobSelectionChange}
                onGroupLinesSelectionChange={handleGroupLinesSelectionChange}
              />
            ))}
          </div>

          {/* Right Column - Overview */}
          <div className="w-[380px] sticky top-[76px] self-start">
            <OverviewPanel
              invoiceId={invoiceId}
              invoiceCount={summary.invoiceCount}
              structureLabel={structureLabels[universalStructure]}
              subtotal={summary.subtotal}
              total={summary.total}
              onSend={handleSendInvoices}
              universalStructure={universalStructure}
              onStructureChange={setUniversalStructure}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

