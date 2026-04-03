import { useState } from "react";
import { Bell } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { addReminder } from "@/lib/firestore";
import { Timestamp } from "firebase/firestore";

interface ReminderFormProps {
  caseId: string;
  patientName: string;
  patientPhone?: string;
}

export function ReminderForm({
  caseId,
  patientName,
  patientPhone,
}: ReminderFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState("Follow-up appointment");
  const [note, setNote] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [channel, setChannel] = useState<"whatsapp" | "sms" | "in-app">(
    "in-app",
  );
  const [phone, setPhone] = useState(patientPhone ?? "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !dueDate || !title) return;

    setSubmitting(true);
    try {
      await addReminder(user.uid, {
        caseId,
        patientName,
        title,
        note: note || undefined,
        dueDate: Timestamp.fromDate(new Date(dueDate)),
        channel,
        phone: channel !== "in-app" ? phone : undefined,
      });

      toast({
        title: "Reminder set",
        description: `Reminder for ${patientName} on ${new Date(dueDate).toLocaleDateString()}.${channel !== "in-app" ? " Notification delivery requires backend setup." : ""}`,
      });

      setOpen(false);
      setTitle("Follow-up appointment");
      setNote("");
      setDueDate("");
    } catch (_err) {
      toast({
        title: "Error",
        description: "Failed to create reminder.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Minimum date = tomorrow
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split("T")[0];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Bell className="mr-1 h-4 w-4" />
          Reminder
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Set Follow-up Reminder</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Patient</Label>
            <div className="text-sm text-[hsl(var(--muted-foreground))] bg-[hsl(var(--accent))] px-3 py-2 rounded">
              {patientName}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reminder-title">Reminder Title *</Label>
            <Input
              id="reminder-title"
              placeholder="e.g., Follow-up appointment"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reminder-date">Due Date *</Label>
            <Input
              id="reminder-date"
              type="date"
              min={minDateStr}
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reminder-note">Note</Label>
            <Textarea
              id="reminder-note"
              placeholder="Additional details..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Notification Channel</Label>
            <Select
              value={channel}
              onValueChange={(v) =>
                setChannel(v as "whatsapp" | "sms" | "in-app")
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in-app">In-App Only</SelectItem>
                <SelectItem value="whatsapp">
                  WhatsApp (requires backend)
                </SelectItem>
                <SelectItem value="sms">SMS (requires backend)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {channel !== "in-app" && (
            <div className="space-y-2">
              <Label htmlFor="reminder-phone">Phone Number *</Label>
              <Input
                id="reminder-phone"
                placeholder="Patient phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <p className="text-xs text-amber-600">
                WhatsApp/SMS delivery requires Cloud Functions setup. Reminders
                will be saved and ready to send once backend is configured.
              </p>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || !dueDate || !title}>
              {submitting && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              )}
              Set Reminder
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
