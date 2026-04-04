import { useRef, useState } from "react";
import { Camera, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { addTimelineEntry } from "@/lib/firestore";
import {
  uploadFile,
  validateFile,
  getFileType,
  STORAGE_LIMIT_BYTES,
} from "@/lib/storage";

interface QuickPhotoCaptureProps {
  caseId: string;
}

export function QuickPhotoCapture({ caseId }: QuickPhotoCaptureProps) {
  const { user, doctor } = useAuth();
  const { toast } = useToast();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0 || !user) return;

    const files = Array.from(fileList);
    for (const file of files) {
      const error = validateFile(file);
      if (error) {
        toast({
          title: "Invalid file",
          description: error,
          variant: "destructive",
        });
        return;
      }
    }

    setUploading(true);
    try {
      // Check storage limit
      if ((doctor?.storageUsedBytes ?? 0) >= STORAGE_LIMIT_BYTES) {
        toast({
          title: "Storage limit reached",
          description:
            "Your storage quota is full. Delete old files or contact admin.",
          variant: "destructive",
        });
        setUploading(false);
        return;
      }

      const entryId = crypto.randomUUID();
      const attachments = [];

      for (const file of files) {
        const { url, storagePath, compressedSize } = await uploadFile(
          user.uid,
          caseId,
          entryId,
          file,
        );
        attachments.push({
          name: file.name,
          url,
          type: getFileType(file),
          size: compressedSize,
          storagePath,
        });
      }

      const isMultiple = files.length > 1;
      const firstFile = files[0];
      const isPdf = firstFile?.type === "application/pdf";

      await addTimelineEntry(user.uid, caseId, {
        type: isPdf ? "note" : "imaging",
        title: isMultiple
          ? `${files.length} files uploaded`
          : `Quick upload: ${firstFile?.name ?? "file"}`,
        description: "",
        priority: "normal",
        attachments,
      });

      toast({
        title: "Uploaded",
        description: `${files.length} file${files.length > 1 ? "s" : ""} added to timeline.`,
      });
    } catch (_err) {
      toast({
        title: "Upload failed",
        description: "Could not upload files. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      // Reset inputs
      if (cameraInputRef.current) cameraInputRef.current.value = "";
      if (galleryInputRef.current) galleryInputRef.current.value = "";
    }
  };

  return (
    <>
      {/* Hidden file inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* FAB */}
      <div className="fixed bottom-24 right-4 lg:bottom-6 lg:right-6 z-40">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              className="h-14 w-14 rounded-full shadow-lg [&_svg]:!h-6 [&_svg]:!w-6"
              disabled={uploading}
              aria-label="Quick upload"
            >
              {uploading ? <Loader2 className="animate-spin" /> : <Camera />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-48">
            <DropdownMenuItem
              onClick={() => cameraInputRef.current?.click()}
              className="gap-2"
            >
              <Camera className="h-4 w-4" />
              Take Photo
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => galleryInputRef.current?.click()}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload File
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}
