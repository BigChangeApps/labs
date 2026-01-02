import { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, ChevronDown, MoreVertical, Download, X, Check } from "lucide-react";
import { Button } from "@/registry/ui/button";
import { Input } from "@/registry/ui/input";
import { Checkbox } from "@/registry/ui/checkbox";
import { Badge } from "@/registry/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/registry/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/ui/table";
import { mockJobs, formatCurrency, type Job } from "../../lib/mock-data";
import { cn } from "@/registry/lib/utils";
import { BreakdownModal } from "../features/invoice-creation/BreakdownModal";
import { toast } from "sonner";
import { getInvoicedJobIds } from "../../lib/invoice-utils";

// Icons matching the Figma design exactly
// Briefcase icon - single job type
function BriefcaseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16.667 5.833H3.333C2.413 5.833 1.667 6.58 1.667 7.5V15.833C1.667 16.754 2.413 17.5 3.333 17.5H16.667C17.587 17.5 18.333 16.754 18.333 15.833V7.5C18.333 6.58 17.587 5.833 16.667 5.833Z" stroke="#475467" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M13.333 17.5V4.167C13.333 3.724 13.157 3.3 12.845 2.988C12.533 2.676 12.109 2.5 11.667 2.5H8.333C7.891 2.5 7.467 2.676 7.155 2.988C6.843 3.3 6.667 3.724 6.667 4.167V17.5" stroke="#475467" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// Stacked layers icon - multiple items
function StacksIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 2.5L2.5 6.25L10 10L17.5 6.25L10 2.5Z" stroke="#475467" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2.5 13.75L10 17.5L17.5 13.75" stroke="#475467" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2.5 10L10 13.75L17.5 10" stroke="#475467" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// Grid/columns icon for table settings
function ColumnsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="4" height="4" rx="0.5" stroke="#555D66" strokeWidth="1.2" fill="none"/>
      <rect x="6" y="1" width="4" height="4" rx="0.5" stroke="#555D66" strokeWidth="1.2" fill="none"/>
      <rect x="11" y="1" width="4" height="4" rx="0.5" stroke="#555D66" strokeWidth="1.2" fill="none"/>
      <rect x="1" y="6" width="4" height="4" rx="0.5" stroke="#555D66" strokeWidth="1.2" fill="none"/>
      <rect x="6" y="6" width="4" height="4" rx="0.5" stroke="#555D66" strokeWidth="1.2" fill="none"/>
      <rect x="11" y="6" width="4" height="4" rx="0.5" stroke="#555D66" strokeWidth="1.2" fill="none"/>
      <rect x="1" y="11" width="4" height="4" rx="0.5" stroke="#555D66" strokeWidth="1.2" fill="none"/>
      <rect x="6" y="11" width="4" height="4" rx="0.5" stroke="#555D66" strokeWidth="1.2" fill="none"/>
      <rect x="11" y="11" width="4" height="4" rx="0.5" stroke="#555D66" strokeWidth="1.2" fill="none"/>
    </svg>
  );
}

const jobTypeIcons = {
  home_repair: <BriefcaseIcon />,
  stacks: <StacksIcon />,
};

function getStatusBadgeClasses(status: Job["status"]) {
  const variantClasses = {
    Scheduled: "bg-sky-100 border-sky-200 text-hw-text",
    "In progress": "bg-sky-600 border-sky-600 text-white hover:bg-sky-600",
    Invoiced: "bg-green-700 border-green-700 text-white hover:bg-green-700",
    Complete: "bg-green-700 border-green-700 text-white hover:bg-green-700",
  };
  return variantClasses[status];
}

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="relative h-[6px] w-10 rounded-full bg-hw-surface-subtle overflow-hidden">
      <div
        className="absolute left-0 top-0 h-full bg-green-700 rounded-full transition-all"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

// Filter select component using registry Select
function FilterSelect({
  label,
  options,
  selected,
  onSelect,
  onClear,
}: {
  label: string;
  options: string[];
  selected: string | null;
  onSelect: (value: string) => void;
  onClear: () => void;
}) {
  const hasSelection = selected !== null;

  return (
    <div className="relative">
      <Select
        value={selected || ""}
        onValueChange={(value) => {
          if (value) {
            onSelect(value);
          }
        }}
      >
        <SelectTrigger
          className={cn(
            "flex items-center gap-1 px-3 py-1.5 h-8 w-auto rounded-md bg-white border border-hw-border text-sm font-medium hover:bg-hw-surface-subtle transition-colors ring-0 shadow-none",
            hasSelection ? "text-hw-brand" : "text-hw-text"
          )}
        >
          <SelectValue placeholder={label}>
            {hasSelection ? selected : label}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="w-56">
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {hasSelection && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-7 top-1/2 -translate-y-1/2 h-auto p-0 hover:bg-transparent"
          onClick={(e) => {
            e.stopPropagation();
            onClear();
          }}
        >
          <X className="h-3.5 w-3.5 text-hw-brand hover:text-hw-text" />
        </Button>
      )}
    </div>
  );
}

// Multi-select filter with checkboxes, search, and Apply/Cancel
function MultiSelectFilter({
  label,
  options,
  selected,
  onChange,
  onClear,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (values: string[]) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingSelection, setPendingSelection] = useState<string[]>(selected);

  const hasSelection = selected.length > 0;

  // Sync pending selection when dropdown opens
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setPendingSelection(selected);
      setSearchQuery("");
    }
    setOpen(isOpen);
  };

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleOption = (option: string) => {
    setPendingSelection(prev =>
      prev.includes(option)
        ? prev.filter(v => v !== option)
        : [...prev, option]
    );
  };

  const handleApply = () => {
    onChange(pendingSelection);
    setOpen(false);
  };

  const handleCancel = () => {
    setPendingSelection(selected);
    setOpen(false);
  };

  const handleClearAll = () => {
    setPendingSelection([]);
  };

  return (
    <div className="relative">
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <button
            className={cn(
              "flex items-center gap-1 py-1.5 h-8 rounded-md border text-sm font-medium transition-colors",
              hasSelection
                ? "pl-3 pr-7 bg-hw-brand/10 border-hw-border text-hw-text hover:bg-hw-brand/15 max-w-[280px]"
                : "px-3 bg-white border-hw-border text-hw-text hover:bg-hw-surface-subtle"
            )}
          >
            <span className={cn(hasSelection && "truncate")}>
              {hasSelection ? selected.join(", ") : label}
            </span>
            {!hasSelection && <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />}
          </button>
        </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-hw-border">
          <span className="text-sm font-semibold text-hw-text">{label}</span>
          <button
            onClick={handleClearAll}
            className="text-sm font-medium text-hw-brand hover:text-hw-brand-hover"
          >
            Clear
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-hw-border">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-hw-text-secondary" />
            <Input
              type="text"
              placeholder=""
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-sm bg-white border border-hw-border"
            />
          </div>
        </div>

        {/* Options list */}
        <div className="max-h-[240px] overflow-y-auto py-2">
          {filteredOptions.map((option) => {
            const isSelected = pendingSelection.includes(option);
            return (
              <button
                key={option}
                onClick={() => toggleOption(option)}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-hw-surface-subtle transition-colors text-left"
              >
                <Checkbox
                  checked={isSelected}
                  className="data-[state=checked]:bg-hw-brand data-[state=checked]:border-hw-brand"
                />
                <span className="text-hw-text">{option}</span>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 p-3 border-t border-hw-border">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleApply}
            className="flex-1"
          >
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
    {hasSelection && (
      <button
        className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-hw-brand/20"
        onClick={(e) => {
          e.stopPropagation();
          onClear();
        }}
      >
        <X className="h-3.5 w-3.5 text-hw-text-secondary" />
      </button>
    )}
    </div>
  );
}

// Date filter dropdown
function DateFilterDropdown({
  label,
  value,
  onChange,
  onClear,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const hasValue = value !== "";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "flex items-center gap-1 px-3 h-8 bg-white border-hw-border text-sm font-medium hover:bg-hw-surface-subtle ring-0 shadow-none",
            hasValue ? "text-hw-brand" : "text-hw-text"
          )}
        >
          {hasValue ? new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : label}
          {hasValue ? (
            <X
              className="h-3.5 w-3.5 text-hw-brand hover:text-hw-text"
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
            />
          ) : (
            <ChevronDown className="h-4 w-4 text-hw-text-secondary" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <div className="space-y-2">
          <p className="text-sm font-medium text-hw-text">{label}</p>
          <Input
            type="date"
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setOpen(false);
            }}
            className="h-8"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

const ITEMS_PER_PAGE_OPTIONS = [25, 50, 100] as const;

export function JobsReadyToInvoice() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Restore selected jobs from location state if coming from empty state
  const locationState = (location.state || {}) as { 
    selectedJobs?: Job[];
    fromEmptyState?: boolean;
  };
  
  const [selectedJobs, setSelectedJobs] = useState<Set<string>>(() => {
    if (locationState.selectedJobs && locationState.fromEmptyState) {
      return new Set(locationState.selectedJobs.map(job => job.id));
    }
    return new Set();
  });
  
  // Clear location state after restoring selection
  useEffect(() => {
    if (locationState.fromEmptyState) {
      window.history.replaceState({}, document.title);
    }
  }, [locationState.fromEmptyState]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"jobs" | "applications">("jobs");
  const [breakdownModalOpen, setBreakdownModalOpen] = useState(false);

  // Pagination states
  const [itemsPerPage, setItemsPerPage] = useState<number>(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPageOpen, setItemsPerPageOpen] = useState(false);

  // Filter states
  const [siteFilter, setSiteFilter] = useState<string | null>(null);
  const [parentFilter, setParentFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");

  // Get invoiced job IDs from localStorage
  const [invoicedJobIds, setInvoicedJobIds] = useState<Set<string>>(() => getInvoicedJobIds());
  
  // Refresh invoiced jobs when returning from invoice preview
  useEffect(() => {
    const state = location.state as { success?: boolean; message?: string } | null;
    if (state?.success) {
      // Refresh invoiced job IDs after sending invoice
      setInvoicedJobIds(getInvoicedJobIds());
    }
  }, [location.state]);

  // Get unique filter options from jobs (excluding invoiced jobs)
  const filterOptions = useMemo(() => {
    const availableJobs = mockJobs.filter(
      job => job.status !== "Invoiced" && !invoicedJobIds.has(job.id)
    );
    const sites = [...new Set(availableJobs.map(job => job.site))].sort();
    const parents = [...new Set(availableJobs.map(job => job.parent))].sort();
    const statuses: Job["status"][] = ["Scheduled", "In progress", "Complete"];
    return { sites, parents, statuses };
  }, [invoicedJobIds]);

  // Handle success message from invoice creation
  useEffect(() => {
    const state = location.state as { success?: boolean; message?: string } | null;
    if (state?.success && state?.message) {
      toast.success(state.message);
      // Clear the state
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const filteredJobs = useMemo(() => {
    // Exclude already invoiced jobs - they don't need to be invoiced
    let jobs = mockJobs.filter(
      job => job.status !== "Invoiced" && !invoicedJobIds.has(job.id)
    );

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      jobs = jobs.filter(
        (job) =>
          job.jobRef.toLowerCase().includes(query) ||
          job.site.toLowerCase().includes(query) ||
          job.parent.toLowerCase().includes(query)
      );
    }

    // Apply site filter
    if (siteFilter) {
      jobs = jobs.filter(job => job.site === siteFilter);
    }

    // Apply parent filter (multi-select)
    if (parentFilter.length > 0) {
      jobs = jobs.filter(job => parentFilter.includes(job.parent));
    }

    // Apply status filter
    if (statusFilter) {
      jobs = jobs.filter(job => job.status === statusFilter);
    }

    // Apply date filters (using the completed date string)
    // Note: This is a simplified implementation - in a real app you'd parse the date properly
    if (startDateFilter) {
      const startDate = new Date(startDateFilter);
      jobs = jobs.filter(job => {
        // Extract the first date from the completed string (e.g., "18 Mar 2024" or "5 Mar – 25 Apr 2024")
        const dateStr = job.completed.split(' – ')[0];
        const jobDate = new Date(dateStr);
        return jobDate >= startDate;
      });
    }

    if (endDateFilter) {
      const endDate = new Date(endDateFilter);
      jobs = jobs.filter(job => {
        // Extract the last date from the completed string
        const parts = job.completed.split(' – ');
        const dateStr = parts[parts.length - 1];
        const jobDate = new Date(dateStr);
        return jobDate <= endDate;
      });
    }

    return jobs;
  }, [searchQuery, siteFilter, parentFilter, statusFilter, startDateFilter, endDateFilter, invoicedJobIds]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, siteFilter, parentFilter, statusFilter, startDateFilter, endDateFilter, itemsPerPage]);

  // Calculate pagination
  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredJobs.length);
  const paginatedJobs = filteredJobs.slice(startIndex, endIndex);

  // Count active filters
  const activeFilterCount = [siteFilter, parentFilter.length > 0, statusFilter, startDateFilter, endDateFilter].filter(Boolean).length;

  const clearAllFilters = () => {
    setSiteFilter(null);
    setParentFilter([]);
    setStatusFilter(null);
    setStartDateFilter("");
    setEndDateFilter("");
  };

  const toggleJobSelection = (jobId: string) => {
    const newSelected = new Set(selectedJobs);
    if (newSelected.has(jobId)) {
      newSelected.delete(jobId);
    } else {
      newSelected.add(jobId);
    }
    setSelectedJobs(newSelected);
  };

  const toggleAllSelection = () => {
    // Check if all paginated jobs are selected
    const allPaginatedSelected = paginatedJobs.every(job => selectedJobs.has(job.id));
    if (allPaginatedSelected) {
      // Deselect all paginated jobs
      const newSelected = new Set(selectedJobs);
      paginatedJobs.forEach(job => newSelected.delete(job.id));
      setSelectedJobs(newSelected);
    } else {
      // Select all paginated jobs
      const newSelected = new Set(selectedJobs);
      paginatedJobs.forEach(job => newSelected.add(job.id));
      setSelectedJobs(newSelected);
    }
  };

  const selectedJobsData = useMemo(() => {
    return mockJobs.filter((job) => selectedJobs.has(job.id));
  }, [selectedJobs]);

  const summary = useMemo(() => {
    const jobs = selectedJobsData.length;
    const sites = new Set(selectedJobsData.map((j) => j.site)).size;
    const parents = new Set(selectedJobsData.map((j) => j.parent)).size;
    const total = selectedJobsData.reduce((sum, job) => sum + job.leftToInvoice, 0);
    return { jobs, sites, parents, total };
  }, [selectedJobsData]);

  // Check if all selected jobs have the same parent contact
  const hasSameParent = useMemo(() => {
    if (selectedJobsData.length === 0) return true;
    const uniqueParents = new Set(selectedJobsData.map((j) => j.parent));
    return uniqueParents.size === 1;
  }, [selectedJobsData]);

  const canCreateInvoice = selectedJobs.size > 0 && hasSameParent;

  const allPaginatedSelected = paginatedJobs.length > 0 && paginatedJobs.every(job => selectedJobs.has(job.id));
  const somePaginatedSelected = paginatedJobs.some(job => selectedJobs.has(job.id)) && !allPaginatedSelected;

  const handleCreateInvoice = (breakdownLevel: "contact" | "site", levelOfDetail: "summary" | "partial" | "detailed") => {
    setBreakdownModalOpen(false);
    
    // Navigate to the invoice creation page with selected jobs data
    navigate("/group-invoicing/v2/workspace", {
      state: {
        selectedJobs: selectedJobsData,
        breakdownLevel,
        levelOfDetail,
      },
    });
  };

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-hw-text">
              Jobs to invoice
            </h1>
            {!breakdownModalOpen && (
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm">
                  Apply for payment
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    // Select all jobs and navigate to empty state screen
                    const allJobIds = new Set(filteredJobs.map((job) => job.id));
                    const allJobsData = filteredJobs;
                    setSelectedJobs(allJobIds);
                    // Navigate to empty state screen
                    navigate("/group-invoicing/v2/empty", {
                      state: {
                        selectedJobs: allJobsData,
                      },
                    });
                  }}
                >
                  Create invoice
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="size-8 p-0 hover:bg-hw-surface-hover"
                >
                  <MoreVertical className="h-5 w-5 text-hw-text" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 border-b border-hw-border px-6">
          <button
            onClick={() => setActiveTab("jobs")}
            className={cn(
              "pb-3 text-sm transition-colors border-b-2 -mb-px",
              activeTab === "jobs"
                ? "border-hw-brand text-hw-text font-medium"
                : "border-transparent text-hw-text-secondary font-normal hover:text-hw-text"
            )}
          >
            Jobs
          </button>
          <button
            onClick={() => setActiveTab("applications")}
            className={cn(
              "pb-3 text-sm transition-colors border-b-2 -mb-px",
              activeTab === "applications"
                ? "border-hw-brand text-hw-text font-medium"
                : "border-transparent text-hw-text-secondary font-normal hover:text-hw-text"
            )}
          >
            Applications for payment
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className={cn("p-6", selectedJobs.size > 0 && "pb-24")}>
        {/* Filters */}
        <div className="mb-4 flex items-center gap-2">
          <div className="flex-1 max-w-[300px]">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-hw-text-secondary" />
              <Input
                type="text"
                placeholder="Search by job ref, contact or order number"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-sm bg-white border border-hw-border placeholder:text-hw-text-secondary ring-0 shadow-none"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FilterSelect
              label="Site"
              options={filterOptions.sites}
              selected={siteFilter}
              onSelect={setSiteFilter}
              onClear={() => setSiteFilter(null)}
            />
            <MultiSelectFilter
              label="Parent"
              options={filterOptions.parents}
              selected={parentFilter}
              onChange={setParentFilter}
              onClear={() => setParentFilter([])}
            />
            <DateFilterDropdown
              label="Start date"
              value={startDateFilter}
              onChange={setStartDateFilter}
              onClear={() => setStartDateFilter("")}
            />
            <DateFilterDropdown
              label="End date"
              value={endDateFilter}
              onChange={setEndDateFilter}
              onClear={() => setEndDateFilter("")}
            />
            <FilterSelect
              label="Status"
              options={filterOptions.statuses}
              selected={statusFilter}
              onSelect={setStatusFilter}
              onClear={() => setStatusFilter(null)}
            />
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="px-2 h-8 text-sm font-medium text-hw-brand hover:text-hw-text hover:bg-transparent"
              >
                Clear all ({activeFilterCount})
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="size-8 p-0 border-hw-border hover:bg-hw-surface-subtle ring-0 shadow-none"
            >
              <Download className="h-4 w-4 text-hw-text" />
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg bg-white border border-hw-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-white hover:bg-white border-b border-hw-border">
                <TableHead className="w-12 h-11 px-4">
                  <Checkbox
                    checked={allPaginatedSelected || (somePaginatedSelected ? "indeterminate" : false)}
                    onCheckedChange={toggleAllSelection}
                    disabled={breakdownModalOpen}
                  />
                </TableHead>
                <TableHead className="w-12 h-11 px-2"></TableHead>
                <TableHead className="w-24 h-11 px-4">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-hw-text-secondary">
                      Job
                    </span>
                    <ChevronDown className="h-4 w-4 text-hw-text-secondary" />
                  </div>
                </TableHead>
                <TableHead className="h-11 px-4">
                  <span className="text-sm font-medium text-hw-text-secondary">
                    Site
                  </span>
                </TableHead>
                <TableHead className="h-11 px-4">
                  <span className="text-sm font-medium text-hw-text-secondary">
                    Parent
                  </span>
                </TableHead>
                <TableHead className="w-44 h-11 px-4">
                  <span className="text-sm font-medium text-hw-text-secondary">
                    Completed
                  </span>
                </TableHead>
                <TableHead className="w-28 h-11 px-4">
                  <span className="text-sm font-medium text-hw-text-secondary">
                    Status
                  </span>
                </TableHead>
                <TableHead className="w-28 h-11 px-4 text-right">
                  <span className="text-sm font-medium text-hw-text-secondary">
                    Selling
                  </span>
                </TableHead>
                <TableHead className="w-32 h-11 px-4 text-right">
                  <span className="text-sm font-medium text-hw-text-secondary">
                    Left to invoice
                  </span>
                </TableHead>
                <TableHead className="w-16 h-11 px-2"></TableHead>
                <TableHead className="w-12 h-11 px-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 h-auto hover:bg-hw-surface-hover"
                  >
                    <ColumnsIcon />
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="h-32 text-center">
                    <div className="text-hw-text-secondary">
                      <p className="text-sm font-medium">No jobs found</p>
                      <p className="text-sm mt-1">Try adjusting your search or filters</p>
                      {activeFilterCount > 0 && (
                        <Button
                          variant="link"
                          size="sm"
                          onClick={clearAllFilters}
                          className="text-sm text-hw-brand mt-2 h-auto p-0"
                        >
                          Clear all filters
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedJobs.map((job) => {
                  const isSelected = selectedJobs.has(job.id);
                  return (
                    <TableRow
                      key={job.id}
                      className={cn(
                        "border-b border-hw-border",
                        isSelected ? "bg-hw-brand/8 hover:bg-hw-brand/12" : "bg-white hover:bg-hw-surface-subtle"
                      )}
                    >
                      <TableCell className="px-4 py-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleJobSelection(job.id)}
                          disabled={breakdownModalOpen}
                        />
                      </TableCell>
                      <TableCell className="px-2 py-3">
                        <div className="flex items-center justify-center">
                          {jobTypeIcons[job.jobType]}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <span className="text-sm font-medium text-hw-text">
                          {job.jobRef}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <span className="text-sm text-hw-text">
                          {job.site}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <span className="text-sm text-hw-text">
                          {job.parent}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <span className="text-sm text-hw-text">
                          {job.completed}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <Badge variant="secondary" className={cn("px-1.5 py-0.5", getStatusBadgeClasses(job.status))}>
                          {job.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-right">
                        <span className="text-sm text-hw-text">
                          {formatCurrency(job.selling)}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-right">
                        <span className="text-sm text-hw-text">
                          {formatCurrency(job.leftToInvoice)}
                        </span>
                      </TableCell>
                      <TableCell className="px-2 py-3">
                        <ProgressBar progress={job.progress} />
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1 h-auto hover:bg-hw-surface-hover"
                        >
                          <MoreVertical className="h-4 w-4 text-hw-text-secondary" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {/* Table Footer */}
          <div className="border-t border-hw-border bg-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-hw-text-secondary">Items per page:</span>
              <Popover open={itemsPerPageOpen} onOpenChange={setItemsPerPageOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-0.5 h-auto p-0 font-medium text-hw-text hover:text-hw-brand hover:bg-transparent"
                  >
                    <span>{itemsPerPage}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-20 p-1" align="start">
                  {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                    <Button
                      key={option}
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setItemsPerPage(option);
                        setItemsPerPageOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-2 h-auto py-1.5 text-sm hover:bg-hw-surface-subtle justify-start",
                        itemsPerPage === option ? "bg-hw-surface-subtle text-hw-brand" : "text-hw-text"
                      )}
                    >
                      <span>{option}</span>
                      {itemsPerPage === option && <Check className="h-4 w-4 text-hw-brand" />}
                    </Button>
                  ))}
                </PopoverContent>
              </Popover>
              <span className="text-hw-text-secondary ml-2">
                {filteredJobs.length === 0 ? '0' : `${startIndex + 1} – ${endIndex}`} of {filteredJobs.length} items
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-hw-text">
              <span>{currentPage} of {totalPages} page{totalPages !== 1 ? 's' : ''}</span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1 h-auto hover:bg-hw-surface-hover disabled:opacity-50"
                >
                  <ChevronDown className="h-4 w-4 rotate-90" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1 h-auto hover:bg-hw-surface-hover disabled:opacity-50"
                >
                  <ChevronDown className="h-4 w-4 -rotate-90" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Multi-Select Action Bar */}
      {selectedJobs.size > 0 && !breakdownModalOpen && (
        <TooltipProvider>
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60]">
            <div className="flex items-center gap-3 px-4 py-3 bg-slate-900 rounded-lg shadow-[0px_8px_24px_rgba(0,0,0,0.24)]">
              <div className="text-sm text-white tracking-[-0.14px]">
                <span className="font-bold">{summary.jobs}</span>{" "}
                <span className="font-normal opacity-80">jobs,</span>{" "}
                <span className="font-bold">{summary.sites}</span>{" "}
                <span className="font-normal opacity-80">sites,</span>{" "}
                <span className="font-bold">{summary.parents}</span>{" "}
                <span className="font-normal opacity-80">parents</span>{" "}
                <span className="font-normal opacity-80">-</span>{" "}
                <span className="font-medium">{formatCurrency(summary.total)}</span>
              </div>
              <div className="w-px h-6 bg-white/20" />
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-slate-800 border-transparent text-white hover:bg-slate-700 shadow-[0_0_0_1px_rgba(11,38,66,0.08)]"
                >
                  Apply for payment
                </Button>
                {canCreateInvoice ? (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setBreakdownModalOpen(true)}
                  >
                    Create Invoice
                  </Button>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span tabIndex={0}>
                        <Button
                          variant="default"
                          size="sm"
                          disabled
                          className="pointer-events-none"
                        >
                          Create Invoice
                        </Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      className="bg-slate-900 text-slate-100 border-none px-3 py-2"
                    >
                      <p className="text-xs font-medium">Invoice with the same parent contact</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
          </div>
        </TooltipProvider>
      )}

      {/* Breakdown Selection Modal */}
      <BreakdownModal
        open={breakdownModalOpen}
        onOpenChange={setBreakdownModalOpen}
        selectedJobs={selectedJobsData}
        onCreateInvoice={handleCreateInvoice}
      />
    </div>
  );
}
