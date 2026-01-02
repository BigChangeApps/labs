import { Check, AlertTriangle } from "lucide-react";
import { cn } from "@/registry/lib/utils";

export interface RadioCardOption<T extends string> {
  id: T;
  label: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
}

export function SettingsRadioCard<T extends string>({
  option,
  selected,
  onChange,
}: {
  option: RadioCardOption<T>;
  selected: boolean;
  onChange: (id: T) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(option.id)}
      className={cn(
        "w-full flex items-start gap-3 p-3 rounded-lg border-[0.5px] text-left transition-all",
        selected
          ? "border-transparent bg-hw-brand/5 ring-1 ring-hw-brand"
          : "border-hw-border bg-hw-surface hover:border-hw-border-hover hover:bg-hw-surface-subtle"
      )}
    >
      <div
        className={cn(
          "shrink-0 mt-0.5 p-1.5 rounded-md",
          selected ? "bg-hw-brand/10 text-hw-brand" : "bg-hw-surface-subtle text-hw-text-secondary"
        )}
      >
        {option.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              "text-sm font-medium tracking-[-0.14px] leading-5",
              selected ? "text-hw-brand" : "text-hw-text"
            )}
          >
            {option.label}
          </span>
          <div
            className={cn(
              "shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors",
              selected ? "border-hw-brand bg-hw-brand" : "border-hw-border"
            )}
          >
            {selected && <Check className="h-2.5 w-2.5 text-white" />}
          </div>
        </div>
        <p className="text-xs text-hw-text-secondary tracking-[-0.12px] leading-4 mt-0.5">
          {option.description}
        </p>
        {option.badge && (
          <span className="inline-block mt-1.5 text-xs font-medium text-hw-text-secondary bg-hw-surface-subtle px-1.5 py-0.5 rounded">
            {option.badge}
          </span>
        )}
      </div>
    </button>
  );
}

export function SettingsRadioGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  warning,
}: {
  label: string;
  options: RadioCardOption<T>[];
  value: T;
  onChange: (value: T) => void;
  warning?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium text-hw-text tracking-[-0.12px] leading-4">
        {label}
      </span>
      <div className="flex flex-col gap-2">
        {options.map((option) => (
          <SettingsRadioCard
            key={option.id}
            option={option}
            selected={value === option.id}
            onChange={onChange}
          />
        ))}
      </div>
      {warning && (
        <div className="flex items-start gap-2 p-2.5 bg-amber-50 rounded-md border border-amber-200 mt-1">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
          <span className="text-xs font-medium text-amber-800 tracking-[-0.12px] leading-4">
            {warning}
          </span>
        </div>
      )}
    </div>
  );
}

export function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-medium text-hw-text-secondary uppercase tracking-wide mb-4">
      {children}
    </h3>
  );
}

