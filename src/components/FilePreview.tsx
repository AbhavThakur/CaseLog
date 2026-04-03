import { useCallback, useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Attachment {
  name: string;
  url: string;
  type: "image" | "pdf" | "document";
}

interface FilePreviewProps {
  attachments: Attachment[];
  initialIndex: number;
  open: boolean;
  onClose: () => void;
}

export function FilePreview({
  attachments,
  initialIndex,
  open,
  onClose,
}: FilePreviewProps) {
  if (!open) return null;
  return (
    <FilePreviewInner
      attachments={attachments}
      initialIndex={initialIndex}
      onClose={onClose}
    />
  );
}

function FilePreviewInner({
  attachments,
  initialIndex,
  onClose,
}: {
  attachments: Attachment[];
  initialIndex: number;
  onClose: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);

  const current = attachments[currentIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < attachments.length - 1;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          if (hasPrev) setCurrentIndex((i) => i - 1);
          break;
        case "ArrowRight":
          if (hasNext) setCurrentIndex((i) => i + 1);
          break;
      }
    },
    [hasPrev, hasNext, onClose],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  if (!current) return null;

  const zoomIn = () => setZoom((z) => Math.min(z + 0.25, 3));
  const zoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.5));

  const navigate = (dir: -1 | 1) => {
    setCurrentIndex((i) => i + dir);
    setZoom(1);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/90"
      role="dialog"
      aria-modal="true"
      aria-label="File preview"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 text-white bg-black/60">
        <span className="text-sm font-medium truncate max-w-[60%]">
          {current.name}
          <span className="ml-2 text-white/60 text-xs">
            {currentIndex + 1} / {attachments.length}
          </span>
        </span>
        <div className="flex items-center gap-1">
          {current.type === "image" && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 h-8 w-8"
                onClick={zoomOut}
                aria-label="Zoom out"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-xs w-12 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 h-8 w-8"
                onClick={zoomIn}
                aria-label="Zoom in"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </>
          )}
          <a
            href={current.url}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="inline-flex items-center justify-center h-8 w-8 rounded-md text-white hover:bg-white/20"
            aria-label="Download file"
          >
            <Download className="h-4 w-4" />
          </a>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 h-8 w-8"
            onClick={onClose}
            aria-label="Close preview"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {/* Prev/Next arrows */}
        {hasPrev && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20 h-10 w-10"
            onClick={() => navigate(-1)}
            aria-label="Previous file"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        )}
        {hasNext && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20 h-10 w-10"
            onClick={() => navigate(1)}
            aria-label="Next file"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        )}

        {/* Image viewer */}
        {current.type === "image" && (
          <div className="overflow-auto max-h-full max-w-full p-4 flex items-center justify-center">
            <img
              src={current.url}
              alt={current.name}
              className="max-w-none transition-transform duration-200"
              style={{ transform: `scale(${zoom})` }}
              draggable={false}
            />
          </div>
        )}

        {/* PDF viewer */}
        {current.type === "pdf" && (
          <iframe
            src={current.url}
            title={current.name}
            className="w-full h-full border-0 bg-white"
          />
        )}

        {/* Other document types */}
        {current.type === "document" && (
          <div className="text-center text-white space-y-4">
            <p className="text-lg">Preview not available for this file type.</p>
            <a
              href={current.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-blue-300 hover:text-blue-200 underline"
            >
              <Download className="h-4 w-4" />
              Download {current.name}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
