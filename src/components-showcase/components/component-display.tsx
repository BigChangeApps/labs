import { type ReactNode } from "react";

interface ComponentDisplayProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function ComponentDisplay({ title, description, children }: ComponentDisplayProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-hw-text mb-2">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="border rounded-lg p-6 bg-card">
        {children}
      </div>
    </div>
  );
}

