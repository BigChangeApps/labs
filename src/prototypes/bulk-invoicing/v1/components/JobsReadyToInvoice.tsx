import { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, ChevronDown, MoreVertical, Download, X, Check } from "lucide-react";
import { Button } from "@/registry/ui/button";
import { Input } from "@/registry/ui/input";
import { Checkbox } from "@/registry/ui/checkbox";
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
import { mockJobs, formatCurrency, type Job } from "../lib/mock-data";
import { cn } from "@/registry/lib/utils";
import { BreakdownModal } from "./BreakdownModal";
import { toast } from "sonner";
import { getInvoicedJobIds } from "../lib/invoice-utils";

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

function StatusBadge({ status }: { status: Job["status"] }) {
  const variants = {
    Scheduled:
      "bg-[#e6f3fa] border border-[rgba(2,136,209,0.2)] text-[#0b2642]",
    "In progress":
      "bg-[#0288d1] border border-[#0288d1] text-white",
    Invoiced: "bg-[#2e7d32] border border-[#2e7d32] text-white",
    Complete: "bg-[#2e7d32] border border-[#2e7d32] text-white",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full px-[6px] py-[2px] text-xs font-medium leading-4 tracking-[-0.12px]",
        variants[status]
      )}
    >
      {status}
    </div>
  );
}

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="relative h-[6px] w-10 rounded-full bg-[#E5E7EB] overflow-hidden">
      <div
        className="absolute left-0 top-0 h-full bg-[#2e7d32] rounded-full transition-all"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

// Filter dropdown component
function FilterDropdown({ 
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
  const [open, setOpen] = useState(false);
  const hasSelection = selected !== null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-1 px-3 py-1.5 h-8 rounded-md bg-white border border-[rgba(16,25,41,0.1)] text-sm font-medium hover:bg-gray-50 transition-colors",
            hasSelection ? "text-[#086DFF]" : "text-[#0B2642]"
          )}
        >
          {hasSelection ? selected : label}
          {hasSelection ? (
            <X 
              className="h-3.5 w-3.5 text-[#086DFF] hover:text-[#0B2642]" 
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
            />
          ) : (
            <ChevronDown className="h-4 w-4 text-[#475467]" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-1" align="start">
        <div className="max-h-[300px] overflow-y-auto">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => {
                onSelect(option);
                setOpen(false);
              }}
              className={cn(
                "w-full flex items-center justify-between px-2 py-1.5 text-sm rounded hover:bg-[#F8F9FC] transition-colors text-left",
                selected === option ? "bg-[#F8F9FC] text-[#086DFF]" : "text-[#0B2642]"
              )}
            >
              <span className="truncate">{option}</span>
              {selected === option && <Check className="h-4 w-4 text-[#086DFF] shrink-0" />}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
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
        <button
          className={cn(
            "flex items-center gap-1 px-3 py-1.5 h-8 rounded-md bg-white border border-[rgba(16,25,41,0.1)] text-sm font-medium hover:bg-gray-50 transition-colors",
            hasValue ? "text-[#086DFF]" : "text-[#0B2642]"
          )}
        >
          {hasValue ? new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : label}
          {hasValue ? (
            <X 
              className="h-3.5 w-3.5 text-[#086DFF] hover:text-[#0B2642]" 
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
            />
          ) : (
            <ChevronDown className="h-4 w-4 text-[#475467]" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <div className="space-y-2">
          <p className="text-sm font-medium text-[#0B2642]">{label}</p>
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
  const [parentFilter, setParentFilter] = useState<string | null>(null);
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

    // Apply parent filter
    if (parentFilter) {
      jobs = jobs.filter(job => job.parent === parentFilter);
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
  const activeFilterCount = [siteFilter, parentFilter, statusFilter, startDateFilter, endDateFilter].filter(Boolean).length;

  const clearAllFilters = () => {
    setSiteFilter(null);
    setParentFilter(null);
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

  const handleCreateInvoice = (breakdownLevel: "contact" | "site" | "job") => {
    setBreakdownModalOpen(false);
    
    // Navigate to the invoice creation page with selected jobs data
    navigate("/bulk-invoicing/v1/create", {
      state: {
        selectedJobs: selectedJobsData,
        breakdownLevel,
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#FCFCFD]">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-[#0B2642]">
              Jobs to invoice
            </h1>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
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
                  navigate("/bulk-invoicing/v1/empty", {
                    state: {
                      selectedJobs: allJobsData,
                    },
                  });
                }}
              >
                Create invoice
              </Button>
              <button className="flex items-center justify-center size-8 rounded-md hover:bg-gray-100">
                <MoreVertical className="h-5 w-5 text-[#0B2642]" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 border-b border-[rgba(16,25,41,0.1)] px-6">
          <button
            onClick={() => setActiveTab("jobs")}
            className={cn(
              "pb-3 text-sm transition-colors border-b-2 -mb-px",
              activeTab === "jobs"
                ? "border-[#086DFF] text-[#0B2642] font-medium"
                : "border-transparent text-[#475467] font-normal hover:text-[#0B2642]"
            )}
          >
            Jobs
          </button>
          <button
            onClick={() => setActiveTab("applications")}
            className={cn(
              "pb-3 text-sm transition-colors border-b-2 -mb-px",
              activeTab === "applications"
                ? "border-[#086DFF] text-[#0B2642] font-medium"
                : "border-transparent text-[#475467] font-normal hover:text-[#0B2642]"
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
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#73777D]" />
              <Input
                type="text"
                placeholder="Search by job ref, contact or order number"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-sm bg-white border border-[rgba(16,25,41,0.1)] placeholder:text-[#73777D]"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FilterDropdown
              label="Site"
              options={filterOptions.sites}
              selected={siteFilter}
              onSelect={setSiteFilter}
              onClear={() => setSiteFilter(null)}
            />
            <FilterDropdown
              label="Parent"
              options={filterOptions.parents}
              selected={parentFilter}
              onSelect={setParentFilter}
              onClear={() => setParentFilter(null)}
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
            <FilterDropdown
              label="Status"
              options={filterOptions.statuses}
              selected={statusFilter}
              onSelect={setStatusFilter}
              onClear={() => setStatusFilter(null)}
            />
            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-1 px-2 py-1.5 h-8 text-sm font-medium text-[#086DFF] hover:text-[#0B2642] transition-colors"
              >
                Clear all ({activeFilterCount})
              </button>
            )}
            <button className="flex items-center justify-center size-8 rounded-md border border-[rgba(16,25,41,0.1)] hover:bg-gray-50">
              <Download className="h-4 w-4 text-[#0B2642]" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg bg-white border border-[rgba(16,25,41,0.1)] overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-white hover:bg-white border-b border-[rgba(16,25,41,0.1)]">
                <TableHead className="w-12 h-11 px-4">
                  <Checkbox
                    checked={allPaginatedSelected || (somePaginatedSelected ? "indeterminate" : false)}
                    onCheckedChange={toggleAllSelection}
                  />
                </TableHead>
                <TableHead className="w-12 h-11 px-2"></TableHead>
                <TableHead className="w-24 h-11 px-4">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-[#475467]">
                      Job
                    </span>
                    <ChevronDown className="h-4 w-4 text-[#475467]" />
                  </div>
                </TableHead>
                <TableHead className="h-11 px-4">
                  <span className="text-sm font-medium text-[#475467]">
                    Site
                  </span>
                </TableHead>
                <TableHead className="h-11 px-4">
                  <span className="text-sm font-medium text-[#475467]">
                    Parent
                  </span>
                </TableHead>
                <TableHead className="w-44 h-11 px-4">
                  <span className="text-sm font-medium text-[#475467]">
                    Completed
                  </span>
                </TableHead>
                <TableHead className="w-28 h-11 px-4">
                  <span className="text-sm font-medium text-[#475467]">
                    Status
                  </span>
                </TableHead>
                <TableHead className="w-28 h-11 px-4 text-right">
                  <span className="text-sm font-medium text-[#475467]">
                    Selling
                  </span>
                </TableHead>
                <TableHead className="w-32 h-11 px-4 text-right">
                  <span className="text-sm font-medium text-[#475467]">
                    Left to invoice
                  </span>
                </TableHead>
                <TableHead className="w-16 h-11 px-2"></TableHead>
                <TableHead className="w-12 h-11 px-4">
                  <button className="flex items-center justify-center p-1 rounded hover:bg-gray-100">
                    <ColumnsIcon />
                  </button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="h-32 text-center">
                    <div className="text-[#73777D]">
                      <p className="text-sm font-medium">No jobs found</p>
                      <p className="text-sm mt-1">Try adjusting your search or filters</p>
                      {activeFilterCount > 0 && (
                        <button
                          onClick={clearAllFilters}
                          className="text-sm text-[#086DFF] mt-2 hover:underline"
                        >
                          Clear all filters
                        </button>
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
                        "border-b border-[rgba(16,25,41,0.1)]",
                        isSelected ? "bg-[#f0f6ff] hover:bg-[#e6f0ff]" : "bg-white hover:bg-[#FAFAFA]"
                      )}
                    >
                      <TableCell className="px-4 py-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleJobSelection(job.id)}
                        />
                      </TableCell>
                      <TableCell className="px-2 py-3">
                        <div className="flex items-center justify-center">
                          {jobTypeIcons[job.jobType]}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <span className="text-sm font-medium text-[#0B2642]">
                          {job.jobRef}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <span className="text-sm text-[#0B2642]">
                          {job.site}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <span className="text-sm text-[#0B2642]">
                          {job.parent}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <span className="text-sm text-[#0B2642]">
                          {job.completed}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <StatusBadge status={job.status} />
                      </TableCell>
                      <TableCell className="px-4 py-3 text-right">
                        <span className="text-sm text-[#0B2642]">
                          {formatCurrency(job.selling)}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-right">
                        <span className="text-sm text-[#0B2642]">
                          {formatCurrency(job.leftToInvoice)}
                        </span>
                      </TableCell>
                      <TableCell className="px-2 py-3">
                        <ProgressBar progress={job.progress} />
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <button className="flex items-center justify-center p-1 rounded hover:bg-gray-100">
                          <MoreVertical className="h-4 w-4 text-[#475467]" />
                        </button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {/* Table Footer */}
          <div className="border-t border-[rgba(16,25,41,0.1)] bg-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[#475467]">Items per page:</span>
              <Popover open={itemsPerPageOpen} onOpenChange={setItemsPerPageOpen}>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-0.5 font-medium text-[#0B2642] hover:text-[#086DFF] transition-colors">
                    <span>{itemsPerPage}</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-20 p-1" align="start">
                  {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setItemsPerPage(option);
                        setItemsPerPageOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-2 py-1.5 text-sm rounded hover:bg-[#F8F9FC] transition-colors text-left",
                        itemsPerPage === option ? "bg-[#F8F9FC] text-[#086DFF]" : "text-[#0B2642]"
                      )}
                    >
                      <span>{option}</span>
                      {itemsPerPage === option && <Check className="h-4 w-4 text-[#086DFF]" />}
                    </button>
                  ))}
                </PopoverContent>
              </Popover>
              <span className="text-[#475467] ml-2">
                {filteredJobs.length === 0 ? '0' : `${startIndex + 1} – ${endIndex}`} of {filteredJobs.length} items
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#0B2642]">
              <span>{currentPage} of {totalPages} page{totalPages !== 1 ? 's' : ''}</span>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronDown className="h-4 w-4 rotate-90" />
                </button>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronDown className="h-4 w-4 -rotate-90" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Multi-Select Action Bar */}
      {selectedJobs.size > 0 && (
        <TooltipProvider>
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60]">
            <div className="flex items-center gap-3 px-4 py-3 bg-[#101929] rounded-lg shadow-[0px_8px_24px_rgba(0,0,0,0.24)]">
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
                  variant="outline" 
                  size="sm"
                  className="bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white"
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
                      className="bg-[#101929] text-[#F3F4F5] border-none px-3 py-2"
                    >
                      <p className="text-xs font-medium">Invoice with the same parent contact</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
              <button 
                onClick={() => setSelectedJobs(new Set())}
                className="p-1.5 hover:bg-white/10 rounded-md transition-colors"
              >
                <X className="h-4 w-4 text-white/60" />
              </button>
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
