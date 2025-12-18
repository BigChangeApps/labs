import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronDown, MoreVertical } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/registry/ui/dialog";
import { Button } from "@/registry/ui/button";
import { Input } from "@/registry/ui/input";
import { Checkbox } from "@/registry/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/ui/table";
import { cn } from "@/registry/lib/utils";
import { mockJobs, formatCurrency, type Job } from "../lib/mock-data";

interface JobSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initiallySelectedJobs?: Job[];
}

// Icons matching the Figma design
function BriefcaseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16.667 5.833H3.333C2.413 5.833 1.667 6.58 1.667 7.5V15.833C1.667 16.754 2.413 17.5 3.333 17.5H16.667C17.587 17.5 18.333 16.754 18.333 15.833V7.5C18.333 6.58 17.587 5.833 16.667 5.833Z" stroke="#475467" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M13.333 17.5V4.167C13.333 3.724 13.157 3.3 12.845 2.988C12.533 2.676 12.109 2.5 11.667 2.5H8.333C7.891 2.5 7.467 2.676 7.155 2.988C6.843 3.3 6.667 3.724 6.667 4.167V17.5" stroke="#475467" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function StacksIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 2.5L2.5 6.25L10 10L17.5 6.25L10 2.5Z" stroke="#475467" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2.5 13.75L10 17.5L17.5 13.75" stroke="#475467" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2.5 10L10 13.75L17.5 10" stroke="#475467" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

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
        "inline-flex items-center justify-center rounded-full px-[6px] py-[2px] text-xs font-medium leading-4 tracking-[-0.12px] whitespace-nowrap",
        variants[status]
      )}
    >
      {status}
    </div>
  );
}

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="relative h-[8px] w-10 rounded-full bg-[rgba(26,28,46,0.05)] overflow-hidden">
      <div
        className="absolute left-0 top-0 h-full bg-[#2e7d32] rounded-full transition-all"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

export function JobSelectionModal({ 
  open, 
  onOpenChange, 
  initiallySelectedJobs = [] 
}: JobSelectionModalProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJobIds, setSelectedJobIds] = useState<Set<string>>(() => {
    return new Set(initiallySelectedJobs.map(job => job.id));
  });
  const [itemsPerPage, setItemsPerPage] = useState(13);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter out invoiced jobs and apply search
  const availableJobs = useMemo(() => {
    let jobs = mockJobs.filter(job => job.status !== "Invoiced");
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      jobs = jobs.filter(
        (job) =>
          job.jobRef.toLowerCase().includes(query) ||
          job.site.toLowerCase().includes(query) ||
          job.parent.toLowerCase().includes(query)
      );
    }
    
    return jobs;
  }, [searchQuery]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(availableJobs.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, availableJobs.length);
  const paginatedJobs = availableJobs.slice(startIndex, endIndex);

  const toggleJobSelection = (jobId: string) => {
    const newSelected = new Set(selectedJobIds);
    if (newSelected.has(jobId)) {
      newSelected.delete(jobId);
    } else {
      newSelected.add(jobId);
    }
    setSelectedJobIds(newSelected);
  };

  const toggleAllSelection = () => {
    const allSelected = paginatedJobs.every(job => selectedJobIds.has(job.id));
    if (allSelected) {
      const newSelected = new Set(selectedJobIds);
      paginatedJobs.forEach(job => newSelected.delete(job.id));
      setSelectedJobIds(newSelected);
    } else {
      const newSelected = new Set(selectedJobIds);
      paginatedJobs.forEach(job => newSelected.add(job.id));
      setSelectedJobIds(newSelected);
    }
  };

  const selectedJobs = useMemo(() => {
    return mockJobs.filter(job => selectedJobIds.has(job.id));
  }, [selectedJobIds]);

  const allPaginatedSelected = paginatedJobs.length > 0 && paginatedJobs.every(job => selectedJobIds.has(job.id));
  const somePaginatedSelected = paginatedJobs.some(job => selectedJobIds.has(job.id)) && !allPaginatedSelected;

  const handleConfirm = () => {
    if (selectedJobs.length === 0) return;
    
    // Navigate to create invoice page with selected jobs
    navigate("/group-invoicing/v2/workspace", {
      state: {
        selectedJobs: selectedJobs,
        breakdownLevel: "contact",
      },
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[1157px] max-w-[1157px] max-h-[90vh] p-0 gap-0 overflow-hidden rounded-lg border border-[rgba(26,28,46,0.12)] shadow-[0px_0px_0px_1px_rgba(26,28,46,0.08),0px_16px_32px_0px_rgba(26,28,46,0.08),0px_2px_24px_0px_rgba(26,28,46,0.08)] flex flex-col [&[data-state=open]]:duration-200 [&[data-state=open]]:animate-in [&[data-state=open]]:fade-in-0 [&[data-state=closed]]:duration-150 [&[data-state=closed]]:animate-out [&[data-state=closed]]:fade-out-0">
        {/* Header */}
        <div className="px-6 py-6 bg-[#F8F9FC] border-b border-[rgba(26,28,46,0.12)] flex items-center justify-between shrink-0">
          <h2 className="text-base font-semibold text-[#0B2642] tracking-[-0.16px]">
            Select jobs
          </h2>
          <button
            onClick={() => onOpenChange(false)}
            className="p-0.5 rounded-md hover:bg-white/50 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 5L5 15M5 5L15 15" stroke="#0B2642" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-4 py-6 border-b border-[rgba(26,28,46,0.12)] shrink-0">
          <div className="relative max-w-[260px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#73777D]" />
            <Input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-8 h-7 text-sm bg-white border border-[rgba(16,25,41,0.1)] placeholder:text-[#73777D]"
            />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-[#FCFCFD]">
                <TableRow className="border-b border-[rgba(26,28,46,0.12)] hover:bg-transparent">
                  <TableHead className="w-12 h-10 px-3">
                    <Checkbox
                      checked={allPaginatedSelected || (somePaginatedSelected ? "indeterminate" : false)}
                      onCheckedChange={toggleAllSelection}
                    />
                  </TableHead>
                  <TableHead className="w-5 h-10 px-0"></TableHead>
                  <TableHead className="w-20 h-10 px-3">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-bold text-[#555D66]">Job</span>
                      <ChevronDown className="h-4 w-4 text-[#555D66]" />
                    </div>
                  </TableHead>
                  <TableHead className="h-10 px-3">
                    <span className="text-sm font-bold text-[#555D66]">Site</span>
                  </TableHead>
                  <TableHead className="h-10 px-3">
                    <span className="text-sm font-bold text-[#555D66]">Parent</span>
                  </TableHead>
                  <TableHead className="w-40 h-10 px-3">
                    <span className="text-sm font-bold text-[#555D66]">Completed</span>
                  </TableHead>
                  <TableHead className="w-20 h-10 px-3">
                    <span className="text-sm font-bold text-[#555D66]">Status</span>
                  </TableHead>
                  <TableHead className="w-20 h-10 px-3 text-right">
                    <span className="text-sm font-bold text-[#555D66]">Selling</span>
                  </TableHead>
                  <TableHead className="w-30 h-10 px-3 text-right">
                    <span className="text-sm font-bold text-[#555D66]">Left to invoice</span>
                  </TableHead>
                  <TableHead className="w-10 h-10 px-0"></TableHead>
                  <TableHead className="w-10 h-10 px-3">
                    <button className="flex items-center justify-center p-1 rounded hover:bg-gray-100">
                      <ColumnsIcon />
                    </button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedJobs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="h-32 text-center">
                      <p className="text-sm text-[#73777D]">No jobs found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedJobs.map((job) => {
                    const isSelected = selectedJobIds.has(job.id);
                    return (
                      <TableRow
                        key={job.id}
                        className={cn(
                          "border-b border-[rgba(26,28,46,0.12)] h-11",
                          isSelected
                            ? "bg-[rgba(8,109,255,0.08)] hover:bg-[rgba(8,109,255,0.12)]"
                            : "bg-white hover:bg-[#FAFAFA]"
                        )}
                      >
                        <TableCell className="px-3 py-2">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleJobSelection(job.id)}
                          />
                        </TableCell>
                        <TableCell className="px-0 py-2">
                          <div className="flex items-center justify-center">
                            {jobTypeIcons[job.jobType]}
                          </div>
                        </TableCell>
                        <TableCell className="px-3 py-2">
                          <span className="text-sm font-medium text-[#0B2642] tracking-[-0.14px]">
                            {job.jobRef}
                          </span>
                        </TableCell>
                        <TableCell className="px-3 py-2">
                          <span className="text-sm font-medium text-[#0B2642] tracking-[-0.14px]">
                            {job.site}
                          </span>
                        </TableCell>
                        <TableCell className="px-3 py-2">
                          <span className="text-sm font-medium text-[#0B2642] tracking-[-0.14px]">
                            {job.parent}
                          </span>
                        </TableCell>
                        <TableCell className="px-3 py-2">
                          <span className="text-sm font-medium text-[#0B2642] tracking-[-0.14px]">
                            {job.completed}
                          </span>
                        </TableCell>
                        <TableCell className="px-3 py-2">
                          <div className="flex items-center min-w-0">
                            <StatusBadge status={job.status} />
                          </div>
                        </TableCell>
                        <TableCell className="px-3 py-2 text-right">
                          <span className="text-sm font-medium text-[#0B2642] tracking-[-0.14px]">
                            {formatCurrency(job.selling)}
                          </span>
                        </TableCell>
                        <TableCell className="px-3 py-2 text-right">
                          <span className="text-sm font-medium text-[#0B2642] tracking-[-0.14px]">
                            {formatCurrency(job.leftToInvoice)}
                          </span>
                        </TableCell>
                        <TableCell className="px-0 py-2">
                          <div className="flex items-center justify-center">
                            <ProgressBar progress={job.progress} />
                          </div>
                        </TableCell>
                        <TableCell className="px-3 py-2">
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
          </div>

          {/* Table Footer with Pagination */}
          <div className="border-t border-[rgba(26,28,46,0.12)] bg-white px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[#0B2642]">Items per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="text-sm font-medium text-[#0B2642] border-none bg-transparent cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={13}>13</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <div className="w-px h-5 bg-[rgba(26,28,46,0.12)] mx-2" />
              <span className="text-[#73777D]">
                {availableJobs.length === 0 ? '0' : `${startIndex + 1} – ${endIndex}`} of {availableJobs.length} items
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-[#0B2642]">
              <span>{currentPage} of {totalPages} page{totalPages !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        {/* Footer with Confirm Button */}
        <div className="px-6 py-4 border-t border-[rgba(26,28,46,0.12)] flex items-center justify-end bg-[#F8F9FC] shrink-0">
          <Button
            variant="default"
            size="default"
            onClick={handleConfirm}
            disabled={selectedJobs.length === 0}
          >
            Confirm selection
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
