import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { createOrUpdateDoctor } from "@/lib/firestore";
import { ImagePlus, Trash2, FileText } from "lucide-react";

export function LetterheadSettings() {
  const { user, doctor, refreshDoctor } = useAuth();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);

  const [clinicName, setClinicName] = useState(
    doctor?.letterhead?.clinicName ?? doctor?.hospital ?? "",
  );
  const [address, setAddress] = useState(doctor?.letterhead?.address ?? "");
  const [phone, setPhone] = useState(
    doctor?.letterhead?.phone ?? doctor?.phone ?? "",
  );
  const [email, setEmail] = useState(doctor?.letterhead?.email ?? "");
  const [registrationNo, setRegistrationNo] = useState(
    doctor?.letterhead?.registrationNo ?? "",
  );
  const [logoBase64, setLogoBase64] = useState<string | undefined>(
    doctor?.letterhead?.logoBase64,
  );

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Max 200KB for Firestore field storage
    if (file.size > 200 * 1024) {
      toast({
        title: "Logo too large",
        description: "Logo must be under 200 KB. Resize and try again.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setLogoBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
    // Reset input so re-selecting same file triggers change
    e.target.value = "";
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await createOrUpdateDoctor(user.uid, {
        letterhead: {
          clinicName: clinicName || undefined,
          address: address || undefined,
          phone: phone || undefined,
          email: email || undefined,
          registrationNo: registrationNo || undefined,
          logoBase64: logoBase64 || undefined,
        },
      });
      await refreshDoctor();
      toast({ title: "Letterhead saved" });
    } catch {
      toast({
        title: "Error",
        description: "Failed to save letterhead settings.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-4 w-4" />
          PDF Letterhead
        </CardTitle>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Your clinic branding will appear on all exported PDFs.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Logo Upload */}
        <div className="space-y-2">
          <Label>Clinic Logo</Label>
          <div className="flex items-center gap-3">
            {logoBase64 ? (
              <div className="relative">
                <img
                  src={logoBase64}
                  alt="Clinic logo"
                  className="h-16 w-16 object-contain rounded-lg border"
                />
                <button
                  type="button"
                  onClick={() => setLogoBase64(undefined)}
                  className="absolute -top-2 -right-2 p-1 rounded-full bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-200"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="h-16 w-16 rounded-lg border-2 border-dashed border-[hsl(var(--border))] flex items-center justify-center hover:border-[hsl(var(--primary))] transition-colors"
              >
                <ImagePlus className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleLogoUpload}
            />
            {logoBase64 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileRef.current?.click()}
              >
                Change
              </Button>
            )}
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              PNG or JPG, max 200 KB
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="lh-clinic">Clinic / Hospital Name</Label>
            <Input
              id="lh-clinic"
              value={clinicName}
              onChange={(e) => setClinicName(e.target.value)}
              placeholder="e.g., City Heart Clinic"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lh-reg">Registration No.</Label>
            <Input
              id="lh-reg"
              value={registrationNo}
              onChange={(e) => setRegistrationNo(e.target.value)}
              placeholder="e.g., MCI-12345"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="lh-address">Address</Label>
          <Textarea
            id="lh-address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Clinic full address"
            rows={2}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="lh-phone">Phone</Label>
            <Input
              id="lh-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Clinic phone"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lh-email">Email</Label>
            <Input
              id="lh-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="clinic@example.com"
            />
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving}>
          {saving && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
          )}
          Save Letterhead
        </Button>
      </CardContent>
    </Card>
  );
}
