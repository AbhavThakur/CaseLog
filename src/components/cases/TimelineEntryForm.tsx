import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Upload, X, Camera } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { addTimelineEntry } from "@/lib/firestore";
import {
  uploadFile,
  validateFile,
  getFileType,
  STORAGE_LIMIT_BYTES,
} from "@/lib/storage";
import {
  timelineEntrySchema,
  type TimelineEntryFormData,
  type TimelineEntryFormInput,
} from "@/lib/schemas";
import { fileSizeToString } from "@/lib/utils";

const entryTypes = [
  { value: "observation", label: "🩺 Observation" },
  { value: "treatment", label: "💉 Treatment" },
  { value: "medication", label: "💊 Medication" },
  { value: "procedure", label: "🏥 Procedure" },
  { value: "lab-result", label: "🔬 Lab Result" },
  { value: "imaging", label: "🖼️ Imaging" },
  { value: "note", label: "📋 Note" },
  { value: "complication", label: "⚠️ Complication" },
];

interface Props {
  open: boolean;
  onClose: () => void;
  caseId: string;
}

export function TimelineEntryForm({ open, onClose, caseId }: Props) {
  const { user, doctor } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<TimelineEntryFormInput, unknown, TimelineEntryFormData>({
    resolver: zodResolver(timelineEntrySchema),
    defaultValues: {
      type: "observation",
      priority: "normal",
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    for (const file of selected) {
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
    setFiles((prev) => [...prev, ...selected]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: TimelineEntryFormData) => {
    if (!user) return;
    setSubmitting(true);

    try {
      // Check storage limit before uploading
      if (files.length > 0) {
        const storageUsed = doctor?.storageUsedBytes ?? 0;
        if (storageUsed >= STORAGE_LIMIT_BYTES) {
          toast({
            title: "Storage limit reached",
            description:
              "Your storage quota is full. Please delete old files or contact admin.",
            variant: "destructive",
          });
          setSubmitting(false);
          return;
        }
      }

      const tempId = crypto.randomUUID();

      const attachments = [];
      for (const file of files) {
        const { url, storagePath, compressedSize } = await uploadFile(
          user.uid,
          caseId,
          tempId,
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

      await addTimelineEntry(user.uid, caseId, {
        type: data.type,
        title: data.title,
        description: data.description ?? "",
        priority: data.priority,
        vitals: data.vitals,
        attachments,
      });

      toast({ title: "Entry added", description: `${data.title}` });
      reset();
      setFiles([]);
      onClose();
    } catch (_err) {
      toast({
        title: "Error",
        description: "Failed to add entry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Timeline Entry</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Entry Type */}
          <div className="space-y-2">
            <Label>Entry Type</Label>
            <div className="grid grid-cols-2 gap-2">
              {entryTypes.map((t) => (
                <Button
                  key={t.value}
                  type="button"
                  variant={watch("type") === t.value ? "default" : "outline"}
                  size="sm"
                  className="justify-start text-xs"
                  onClick={() =>
                    setValue("type", t.value as TimelineEntryFormData["type"])
                  }
                >
                  {t.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Brief summary of the entry"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-sm text-[hsl(var(--destructive))]">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Detailed notes..."
              rows={3}
              {...register("description")}
            />
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label>Priority</Label>
            <div className="flex gap-2">
              {(["normal", "important", "critical"] as const).map((p) => (
                <Button
                  key={p}
                  type="button"
                  size="sm"
                  variant={watch("priority") === p ? "default" : "outline"}
                  className={
                    watch("priority") === p
                      ? p === "critical"
                        ? "bg-red-600 hover:bg-red-700"
                        : p === "important"
                          ? "bg-amber-600 hover:bg-amber-700"
                          : ""
                      : ""
                  }
                  onClick={() => setValue("priority", p)}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Quick Vitals */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Quick Vitals (optional)
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs text-[hsl(var(--muted-foreground))]">
                  BP
                </Label>
                <Input
                  placeholder="120/80"
                  className="h-8 text-sm"
                  {...register("vitals.bloodPressure")}
                />
              </div>
              <div>
                <Label className="text-xs text-[hsl(var(--muted-foreground))]">
                  Pulse
                </Label>
                <Input
                  type="number"
                  placeholder="bpm"
                  className="h-8 text-sm"
                  {...register("vitals.pulse")}
                />
              </div>
              <div>
                <Label className="text-xs text-[hsl(var(--muted-foreground))]">
                  Temp
                </Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="°F"
                  className="h-8 text-sm"
                  {...register("vitals.temperature")}
                />
              </div>
              <div>
                <Label className="text-xs text-[hsl(var(--muted-foreground))]">
                  SpO2
                </Label>
                <Input
                  type="number"
                  placeholder="%"
                  className="h-8 text-sm"
                  {...register("vitals.spO2")}
                />
              </div>
              <div>
                <Label className="text-xs text-[hsl(var(--muted-foreground))]">
                  Resp Rate
                </Label>
                <Input
                  type="number"
                  placeholder="/min"
                  className="h-8 text-sm"
                  {...register("vitals.respiratoryRate")}
                />
              </div>
              <div>
                <Label className="text-xs text-[hsl(var(--muted-foreground))]">
                  Weight
                </Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="kg"
                  className="h-8 text-sm"
                  {...register("vitals.weight")}
                />
              </div>
            </div>
          </div>

          {/* File Attachments */}
          <div className="space-y-2">
            <Label>Attachments</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-1 h-4 w-4" />
                Upload
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.capture = "environment";
                    fileInputRef.current.click();
                    fileInputRef.current.removeAttribute("capture");
                  }
                }}
              >
                <Camera className="mr-1 h-4 w-4" />
                Camera
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
            {files.length > 0 && (
              <div className="space-y-1 mt-2">
                {files.map((file, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-sm bg-[hsl(var(--accent))] px-3 py-1.5 rounded"
                  >
                    <span className="truncate flex-1">{file.name}</span>
                    <span className="text-xs text-[hsl(var(--muted-foreground))] mx-2">
                      {fileSizeToString(file.size)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))]"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              )}
              Save Entry
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
