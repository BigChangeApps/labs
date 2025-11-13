import { useState, useRef, useEffect } from "react";
import { MoreVertical, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/ui/table";
import { Checkbox } from "@/registry/ui/checkbox";
import { Badge } from "@/registry/ui/badge";
import { Button } from "@/registry/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/registry/ui/tooltip";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/registry/ui/card";
import { useMediaQuery } from "@/registry/hooks/use-media-query";
import { cn } from "@/registry/lib/utils";

// Job data interface based on Figma design
interface Job {
  id: string;
  jobId: string;
  jobRef: string;
  site: string;
  siteParent?: string;
  billing: string;
  completed: string; // date range or single date
  flag: string; // e.g., "To invoice"
  status: string; // e.g., "Complete"
  cost: number;
  margin: number; // percentage
  selling: number;
  leftToInvoice: number;
}

// Dummy job data matching Figma examples
const dummyJobs: Job[] = [
  {
    id: "1",
    jobId: "381910",
    jobRef: "NXT950302",
    site: "Next White Rose Leeds",
    siteParent: "Next Head Office",
    billing: "Next Head Office",
    completed: "1 Feb - 18 Mar 2024",
    flag: "To invoice",
    status: "Complete",
    cost: 1430.0,
    margin: 85.2,
    selling: 8393.0,
    leftToInvoice: 1000.0,
  },
  {
    id: "2",
    jobId: "GR/5984",
    jobRef: "",
    site: "Costa Coffee Headingley",
    billing: "Costa Coffee UK",
    completed: "17 March 2024",
    flag: "To invoice",
    status: "Complete",
    cost: 1035.0,
    margin: 65.5,
    selling: 3000.0,
    leftToInvoice: 0.0,
  },
  {
    id: "3",
    jobId: "Job Ref",
    jobRef: "Cafe Nero UK",
    site: "Cafe Nero Leeds",
    siteParent: "Cafe Nero UK",
    billing: "Cafe Nero Leeds",
    completed: "14 Mar - 17 Mar 2024",
    flag: "To invoice",
    status: "Complete",
    cost: 550.0,
    margin: 80.0,
    selling: 2750.0,
    leftToInvoice: 0.0,
  },
  {
    id: "4",
    jobId: "382011",
    jobRef: "NXT950401",
    site: "Next Trafford Centre",
    siteParent: "Next Head Office",
    billing: "Next Head Office",
    completed: "20 Mar - 5 Apr 2024",
    flag: "To invoice",
    status: "Complete",
    cost: 2100.0,
    margin: 78.5,
    selling: 9750.0,
    leftToInvoice: 2500.0,
  },
  {
    id: "5",
    jobId: "ST/1234",
    jobRef: "",
    site: "Starbucks Manchester",
    billing: "Starbucks UK",
    completed: "25 March 2024",
    flag: "To invoice",
    status: "Complete",
    cost: 875.0,
    margin: 70.0,
    selling: 2916.67,
    leftToInvoice: 500.0,
  },
  {
    id: "6",
    jobId: "382156",
    jobRef: "NXT950512",
    site: "Next Birmingham",
    siteParent: "Next Head Office",
    billing: "Next Head Office",
    completed: "1 Apr - 15 Apr 2024",
    flag: "To invoice",
    status: "Complete",
    cost: 1890.0,
    margin: 82.3,
    selling: 10650.0,
    leftToInvoice: 1500.0,
  },
  {
    id: "7",
    jobId: "CC/7890",
    jobRef: "",
    site: "Costa Coffee Liverpool",
    billing: "Costa Coffee UK",
    completed: "10 April 2024",
    flag: "To invoice",
    status: "Complete",
    cost: 1200.0,
    margin: 68.0,
    selling: 3750.0,
    leftToInvoice: 0.0,
  },
  {
    id: "8",
    jobId: "CC/8901",
    jobRef: "",
    site: "Costa Coffee Birmingham",
    billing: "Costa Coffee UK",
    completed: "15 Apr - 22 Apr 2024",
    flag: "To invoice",
    status: "Complete",
    cost: 1500.0,
    margin: 72.0,
    selling: 5357.14,
    leftToInvoice: 2000.0,
  },
];

// Format currency to GBP
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 2,
  }).format(amount);
};

// Format percentage
const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

// Format date to shortened consistent format
const formatDate = (dateStr: string): string => {
  // Map full month names to abbreviations
  const monthMap: Record<string, string> = {
    January: "Jan",
    February: "Feb",
    March: "Mar",
    April: "Apr",
    May: "May",
    June: "Jun",
    July: "Jul",
    August: "Aug",
    September: "Sep",
    October: "Oct",
    November: "Nov",
    December: "Dec",
  };

  // If it's a date range like "1 Feb - 18 Mar 2024", shorten to "1 Feb - 18 Mar"
  if (dateStr.includes(" - ")) {
    const [start, end] = dateStr.split(" - ");
    let startShort = start.replace(/\d{4}$/, "").trim();
    let endShort = end.replace(/\d{4}$/, "").trim();
    
    // Shorten month names
    Object.entries(monthMap).forEach(([full, short]) => {
      startShort = startShort.replace(full, short);
      endShort = endShort.replace(full, short);
    });
    
    return `${startShort} - ${endShort}`;
  }
  
  // If it's a single date like "17 March 2024", shorten to "17 Mar"
  let shortened = dateStr.replace(/\d{4}$/, "").trim();
  Object.entries(monthMap).forEach(([full, short]) => {
    shortened = shortened.replace(full, short);
  });
  
  return shortened;
};

// AFP Validation Types
interface AFPValidationResult {
  isValid: boolean;
  eligibleJobs: Job[];
  errorMessage: string | null;
}

// Validation helper functions
/**
 * Validates that all selected jobs have the same billing contact
 */
function validateBillingContacts(jobs: Job[]): { isValid: boolean; uniqueContacts: Set<string> } {
  if (jobs.length === 0) {
    return { isValid: true, uniqueContacts: new Set() };
  }
  
  const uniqueContacts = new Set(jobs.map((job) => job.billing));
  return {
    isValid: uniqueContacts.size === 1,
    uniqueContacts,
  };
}

/**
 * Filters jobs that are eligible for invoicing (have leftToInvoice > 0)
 */
function getEligibleJobs(jobs: Job[]): Job[] {
  return jobs.filter((job) => {
    // Validate job data
    if (!job || typeof job.leftToInvoice !== "number") {
      return false;
    }
    return job.leftToInvoice > 0;
  });
}

/**
 * Validates if AFP action can be performed on selected jobs
 * Returns validation result with eligible jobs and error message if invalid
 */
function validateAFPAction(selectedJobs: Job[]): AFPValidationResult {
  // Edge case: empty selection
  if (selectedJobs.length === 0) {
    return {
      isValid: false,
      eligibleJobs: [],
      errorMessage: "No jobs selected",
    };
  }

  // Edge case: invalid job data
  const validJobs = selectedJobs.filter(
    (job) => job && job.id && job.billing && typeof job.leftToInvoice === "number"
  );
  
  if (validJobs.length === 0) {
    return {
      isValid: false,
      eligibleJobs: [],
      errorMessage: "No valid jobs selected",
    };
  }

  // Check billing contacts
  const billingValidation = validateBillingContacts(validJobs);
  if (!billingValidation.isValid) {
    return {
      isValid: false,
      eligibleJobs: [],
      errorMessage: "Only one billing contact per application",
    };
  }

  // Get eligible jobs (only if billing contacts are valid)
  const eligibleJobs = getEligibleJobs(validJobs);
  
  if (eligibleJobs.length === 0) {
    return {
      isValid: false,
      eligibleJobs: [],
      errorMessage: "No items available to invoice",
    };
  }

  return {
    isValid: true,
    eligibleJobs,
    errorMessage: null,
  };
}

// Mobile Card Component for Job
interface JobCardProps {
  job: Job;
  isSelected: boolean;
  onSelect: (jobId: string, checked: boolean) => void;
}

function JobCard({ job, isSelected, onSelect }: JobCardProps) {
  return (
    <Card
      className={cn(
        "transition-colors",
        isSelected && "bg-muted/50 border-primary"
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) => onSelect(job.id, !!checked)}
              aria-label={`Select job ${job.jobId}`}
              className="mt-1"
            />
            <div className="flex-1 min-w-0">
              <div className="flex flex-col gap-1">
                <span className="font-medium text-sm">{job.jobId}</span>
                {job.jobRef && (
                  <span className="text-xs text-muted-foreground">{job.jobRef}</span>
                )}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Site</div>
            <div className="flex flex-col">
              <span className="font-medium text-sm">{job.site}</span>
              {job.siteParent && (
                <span className="text-xs text-muted-foreground">{job.siteParent}</span>
              )}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Billing</div>
            <span className="font-medium text-sm">{job.billing}</span>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Completed</div>
            <span className="text-sm">{formatDate(job.completed)}</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="whitespace-nowrap">{job.status}</Badge>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-3 border-t">
        <div className="grid grid-cols-2 gap-4 w-full text-sm">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Margin</div>
            <div className="font-medium">{formatPercentage(job.margin)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Selling</div>
            <div className="font-medium">{formatCurrency(job.selling)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1 whitespace-nowrap">Left to invoice</div>
            <div className="font-medium">{formatCurrency(job.leftToInvoice)}</div>
          </div>
        </div>
        {job.selling > 0 && (
          <div className="w-full mt-2">
            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-primary h-full transition-all"
                style={{ 
                  width: `${Math.min(((job.selling - job.leftToInvoice) / job.selling) * 100, 100)}%` 
                }}
              />
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

export function TableActionBarDemo() {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [actionBarLeft, setActionBarLeft] = useState<number | null>(null);
  const [isAFPLoading, setIsAFPLoading] = useState(false);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  useEffect(() => {
    const updateActionBarPosition = () => {
      if (tableContainerRef.current) {
        const rect = tableContainerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        setActionBarLeft(centerX);
      }
    };

    // Update position initially and when selections change
    updateActionBarPosition();

    // Set up listeners for window events
    window.addEventListener("resize", updateActionBarPosition);
    window.addEventListener("scroll", updateActionBarPosition);

    return () => {
      window.removeEventListener("resize", updateActionBarPosition);
      window.removeEventListener("scroll", updateActionBarPosition);
    };
  }, [selectedRows]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(dummyJobs.map((job) => job.id)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleRowSelect = (jobId: string, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(jobId);
    } else {
      newSelected.delete(jobId);
    }
    setSelectedRows(newSelected);
  };

  const isAllSelected = selectedRows.size === dummyJobs.length && dummyJobs.length > 0;
  const isSomeSelected = selectedRows.size > 0 && selectedRows.size < dummyJobs.length;

  const selectedCount = selectedRows.size;
  const selectedJobs = dummyJobs.filter((job) => selectedRows.has(job.id));
  const selectedTotal = selectedJobs.reduce((sum, job) => sum + job.selling, 0);

  // Validate AFP action using helper functions
  const afpValidation = validateAFPAction(selectedJobs);
  
  // Button is disabled if validation fails or if loading
  const isButtonDisabled = !afpValidation.isValid || isAFPLoading;
  const showWarningIcon = !afpValidation.isValid && selectedCount > 0;

  // Get tooltip message for disabled state
  // NOTE: We keep the AFP button visible (but disabled) even with validation failures
  // because this is currently the main route into AFP creation. Users need to discover
  // and learn the constraints (one billing contact, items available to invoice).
  // FUTURE: When alternative AFP entry points exist, consider hiding the button for
  // multiple contacts instead of disabling it, to reduce visual clutter.
  const tooltipMessage = afpValidation.errorMessage || null;

  // Handle AFP button click with proper error handling and loading state
  const handleAFPClick = async () => {
    // Double-check validation (defensive programming)
    if (!afpValidation.isValid || isAFPLoading) {
      if (afpValidation.errorMessage) {
        toast.error(afpValidation.errorMessage);
      }
      return;
    }

    setIsAFPLoading(true);

    try {
      // Simulate async AFP creation
      // In a real application, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Validate again before proceeding (data might have changed)
      const revalidation = validateAFPAction(selectedJobs);
      if (!revalidation.isValid) {
        toast.error(revalidation.errorMessage || "Validation failed. Please try again.");
        setIsAFPLoading(false);
        return;
      }

      // Success - show success message
      const jobCount = revalidation.eligibleJobs.length;
      const totalAmount = revalidation.eligibleJobs.reduce(
        (sum, job) => sum + job.leftToInvoice,
        0
      );
      
      toast.success(
        `Application for Payment created successfully for ${jobCount} ${jobCount === 1 ? "job" : "jobs"} (${formatCurrency(totalAmount)})`
      );

      // Clear selection after successful creation
      setSelectedRows(new Set());
    } catch (error) {
      // Handle errors
      const errorMessage = error instanceof Error ? error.message : "Failed to create Application for Payment";
      toast.error(errorMessage);
      console.error("AFP creation error:", error);
    } finally {
      setIsAFPLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-hw-text mb-2">Table action bar</h1>
        <p className="text-sm text-muted-foreground">
          Behaviour when selecting items on a table to show action bar
        </p>
      </div>
      <div ref={tableContainerRef} className="relative w-full">
        {isDesktop ? (
          <div className="overflow-hidden rounded-lg border border-border bg-card w-full">
            <Table className="min-w-full">
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-12 min-w-[48px] sticky left-0 bg-muted/50 z-10">
                    <Checkbox
                      checked={isAllSelected || (isSomeSelected ? "indeterminate" : false)}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead className="w-[120px] min-w-[120px]">Job</TableHead>
                  <TableHead className="min-w-[150px]">Site</TableHead>
                  <TableHead className="min-w-[120px]">Billing</TableHead>
                  <TableHead className="min-w-[100px] whitespace-nowrap">Completed</TableHead>
                  <TableHead className="w-[80px] min-w-[80px]">Status</TableHead>
                  <TableHead className="text-right w-[100px] min-w-[100px] whitespace-nowrap">Margin</TableHead>
                  <TableHead className="text-right w-[100px] min-w-[100px] whitespace-nowrap">Selling</TableHead>
                  <TableHead className="text-right w-[140px] min-w-[140px] whitespace-nowrap">Left to invoice</TableHead>
                  <TableHead className="w-[80px] min-w-[80px]"></TableHead>
                  <TableHead className="w-[40px] min-w-[40px] sticky right-0 bg-muted/50 z-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dummyJobs.map((job) => {
                  const isSelected = selectedRows.has(job.id);
                  return (
                    <TableRow
                      key={job.id}
                      data-state={isSelected ? "selected" : undefined}
                    >
                      <TableCell className={cn(
                        "sticky left-0 z-10",
                        isSelected ? "bg-muted" : "bg-card"
                      )}>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => handleRowSelect(job.id, !!checked)}
                          aria-label={`Select job ${job.jobId}`}
                        />
                      </TableCell>
                      <TableCell className="max-w-[120px]">
                        <div className="flex flex-col min-w-0">
                          <span className="font-medium text-sm truncate">{job.jobId}</span>
                          {job.jobRef && (
                            <span className="text-xs text-muted-foreground truncate">{job.jobRef}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <div className="flex flex-col min-w-0">
                          <span className="font-medium text-sm truncate">{job.site}</span>
                          {job.siteParent && (
                            <span className="text-xs text-muted-foreground truncate">{job.siteParent}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[180px]">
                        <span className="font-medium text-sm truncate block">{job.billing}</span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <span className="text-sm">{formatDate(job.completed)}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="whitespace-nowrap">{job.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <span className="text-sm font-medium">{formatPercentage(job.margin)}</span>
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <span className="text-sm font-medium">{formatCurrency(job.selling)}</span>
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap w-[140px]">
                        <span className="text-sm font-medium">
                          {formatCurrency(job.leftToInvoice)}
                        </span>
                      </TableCell>
                      <TableCell className="w-[80px] min-w-[80px] px-3 py-3">
                        <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden border border-border/50">
                          {job.selling > 0 && (
                            <div
                              className="bg-primary h-full transition-all"
                              style={{ 
                                width: `${Math.min(((job.selling - job.leftToInvoice) / job.selling) * 100, 100)}%` 
                              }}
                            />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className={cn(
                        "sticky right-0 z-10",
                        isSelected ? "bg-muted" : "bg-card"
                      )}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3 px-4 py-2 border-b border-border">
              <Checkbox
                checked={isAllSelected || (isSomeSelected ? "indeterminate" : false)}
                onCheckedChange={handleSelectAll}
                aria-label="Select all"
              />
              <span className="text-sm font-medium text-muted-foreground">
                Select all jobs
              </span>
            </div>
            {dummyJobs.map((job) => {
              const isSelected = selectedRows.has(job.id);
              return (
                <JobCard
                  key={job.id}
                  job={job}
                  isSelected={isSelected}
                  onSelect={handleRowSelect}
                />
              );
            })}
          </div>
        )}

        {/* Floating Action Bar */}
        {selectedCount > 0 && actionBarLeft !== null && (
          <div 
            className="fixed bottom-6 z-50 bg-gray-950 border-gray-800 border rounded-lg shadow-lg px-4 py-3 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 max-w-[calc(100vw-2rem)] sm:max-w-none"
            style={{ 
              left: isDesktop ? `${actionBarLeft}px` : '50%',
              transform: isDesktop ? 'translateX(-50%)' : 'translateX(-50%)'
            }}
          >
            <div className="text-sm font-medium text-gray-50 whitespace-nowrap">
              {selectedCount} {selectedCount === 1 ? "job" : "jobs"} –{" "}
              <span className="font-bold">{formatCurrency(selectedTotal)}</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-center">
              {selectedCount > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="bg-gray-800 text-gray-50 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                          onClick={handleAFPClick}
                          disabled={isButtonDisabled}
                        >
                          {isAFPLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              <span className="hidden sm:inline">Creating...</span>
                              <span className="sm:hidden">Creating...</span>
                            </>
                          ) : (
                            <>
                              <span className="hidden sm:inline">Application for Payment</span>
                              <span className="sm:hidden">AFP</span>
                              {showWarningIcon && (
                                <AlertTriangle className="ml-2 h-4 w-4" />
                              )}
                            </>
                          )}
                        </Button>
                      </span>
                    </TooltipTrigger>
                    {tooltipMessage && !isAFPLoading && (
                      <TooltipContent>
                        <p>{tooltipMessage}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              )}
              <Button variant="secondary" size="sm" className="bg-gray-800 text-gray-50 hover:bg-gray-700 text-xs sm:text-sm">
                Invoice
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-50 hover:bg-gray-800">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
