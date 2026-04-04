import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { NotFoundIllustration } from "@/components/illustrations";

export default function NotFoundPage() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="max-w-md w-full text-center space-y-2">
        <NotFoundIllustration className="w-52 h-52 mx-auto" />
        <h1 className="text-5xl font-extrabold tracking-tight text-[hsl(var(--foreground))]">
          404
        </h1>
        <p className="text-lg text-[hsl(var(--muted-foreground))]">
          Page not found
        </p>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="pt-4">
          <Button asChild size="lg" className="rounded-xl">
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
