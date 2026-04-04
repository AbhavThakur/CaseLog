import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { createOrUpdateDoctor } from "@/lib/firestore";
import { uploadProfilePhoto } from "@/lib/storage";
import { profileSchema, type ProfileFormData } from "@/lib/schemas";
import { LetterheadSettings } from "@/components/settings/LetterheadSettings";
import { Camera } from "lucide-react";

export default function ProfilePage() {
  const { user, doctor, refreshDoctor } = useAuth();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const photoRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: doctor?.displayName ?? user?.displayName ?? "",
      specialization: doctor?.specialization ?? "",
      hospital: doctor?.hospital ?? "",
      practiceType: doctor?.practiceType ?? "hospital",
      phone: doctor?.phone ?? "",
    },
  });

  const initials = (doctor?.displayName ?? user?.displayName ?? "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Photo too large",
        description: "Max 5 MB.",
        variant: "destructive",
      });
      return;
    }
    setUploading(true);
    try {
      const url = await uploadProfilePhoto(user.uid, file);
      await createOrUpdateDoctor(user.uid, { photoURL: url });
      await refreshDoctor();
      toast({ title: "Profile photo updated" });
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;
    setSubmitting(true);
    try {
      await createOrUpdateDoctor(user.uid, {
        displayName: data.displayName,
        specialization: data.specialization,
        hospital: data.hospital,
        practiceType: data.practiceType,
        phone: data.phone,
      });
      await refreshDoctor();
      toast({ title: "Profile updated" });
    } catch (_err) {
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Profile & Settings</h1>

      {/* Avatar / Account Info */}
      <Card>
        <CardContent className="flex items-center gap-4 pt-6">
          <div className="relative group">
            <Avatar className="h-16 w-16">
              <AvatarImage
                src={doctor?.photoURL ?? user?.photoURL ?? undefined}
                alt={doctor?.displayName ?? "User"}
              />
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <button
              type="button"
              onClick={() => photoRef.current?.click()}
              disabled={uploading}
              className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              {uploading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              ) : (
                <Camera className="h-5 w-5 text-white" />
              )}
            </button>
            <input
              ref={photoRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handlePhotoUpload}
            />
          </div>
          <div>
            <p className="font-semibold text-lg">
              {doctor?.displayName ?? user?.displayName ?? "Doctor"}
            </p>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              {user?.email}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Edit Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Doctor Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Full Name *</Label>
              <Input
                id="displayName"
                placeholder="Dr. Full Name"
                {...register("displayName")}
              />
              {errors.displayName && (
                <p className="text-sm text-[hsl(var(--destructive))]">
                  {errors.displayName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialization">Specialization *</Label>
              <Input
                id="specialization"
                placeholder="e.g., Cardiology, Orthopedics"
                {...register("specialization")}
              />
              {errors.specialization && (
                <p className="text-sm text-[hsl(var(--destructive))]">
                  {errors.specialization.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="hospital">Hospital / Clinic *</Label>
              <Input
                id="hospital"
                placeholder="Hospital or clinic name"
                {...register("hospital")}
              />
              {errors.hospital && (
                <p className="text-sm text-[hsl(var(--destructive))]">
                  {errors.hospital.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Practice Type *</Label>
              <Select
                value={watch("practiceType")}
                onValueChange={(v) =>
                  setValue("practiceType", v as "hospital" | "clinic" | "both")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select practice type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hospital">Hospital</SelectItem>
                  <SelectItem value="clinic">Clinic</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
              {errors.practiceType && (
                <p className="text-sm text-[hsl(var(--destructive))]">
                  {errors.practiceType.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                placeholder="Phone number"
                {...register("phone")}
              />
            </div>

            <Button type="submit" disabled={submitting}>
              {submitting && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              )}
              Save Profile
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Letterhead Settings */}
      <LetterheadSettings />
    </div>
  );
}
