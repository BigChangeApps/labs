/**
 * Simple landing page shown when VITE_SHOW_INTERNAL=false
 * Indicates that users need a direct link to access prototypes
 */
export function PublicLanding() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md text-center px-4">
        <h1 className="text-4xl font-bold mb-4 text-foreground">
          BigChange Labs
        </h1>
        <p className="text-muted-foreground text-lg">
          Please use the direct link provided to access your prototype.
        </p>
      </div>
    </div>
  );
}
