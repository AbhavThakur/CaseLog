import { useEffect, useState } from "react";
import { Navigate } from "react-router";
import {
  Shield,
  Users,
  HardDrive,
  Settings,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  getAllDoctors,
  getAppConfig,
  updateAppConfig,
  setDoctorAdmin,
} from "@/lib/firestore";
import type { Doctor, AppConfig } from "@/lib/types";
import {
  formatStorageSize,
  STORAGE_LIMIT_BYTES,
  STORAGE_WARNING_BYTES,
} from "@/lib/storage";

export default function AdminPage() {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [config, setConfig] = useState<Partial<AppConfig>>({
    maxFilesPerCase: 50,
    maxFileSizeMB: 5,
    storageLimitGB: 1,
    compressionQuality: 0.82,
    allowNewRegistrations: true,
    maintenanceMode: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    const loadData = async () => {
      const [allDoctors, appConfig] = await Promise.all([
        getAllDoctors(),
        getAppConfig(),
      ]);
      setDoctors(allDoctors);
      if (appConfig) setConfig(appConfig);
      setLoading(false);
    };
    loadData();
  }, [isAdmin]);

  // If not admin, redirect (after all hooks)
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const totalStorageUsed = doctors.reduce(
    (sum, d) => sum + (d.storageUsedBytes ?? 0),
    0,
  );
  const storagePercent = Math.round(
    (totalStorageUsed / STORAGE_LIMIT_BYTES) * 100,
  );
  const isStorageWarning = totalStorageUsed >= STORAGE_WARNING_BYTES;
  const isStorageCritical = totalStorageUsed >= STORAGE_LIMIT_BYTES;

  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      await updateAppConfig(config);
      toast({ title: "Settings saved" });
    } catch (_err) {
      toast({
        title: "Error",
        description: "Failed to save settings.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleAdmin = async (doctorId: string, current: boolean) => {
    if (doctorId === user?.uid) {
      toast({
        title: "Cannot modify your own admin status",
        variant: "destructive",
      });
      return;
    }
    await setDoctorAdmin(doctorId, !current);
    setDoctors((prev) =>
      prev.map((d) => (d.uid === doctorId ? { ...d, isAdmin: !current } : d)),
    );
    toast({
      title: !current ? "Admin access granted" : "Admin access revoked",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--primary))]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Shield className="h-6 w-6 text-[hsl(var(--primary))]" />
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      </div>

      {/* Storage Overview */}
      <Card
        className={
          isStorageCritical
            ? "border-red-300 dark:border-red-800"
            : isStorageWarning
              ? "border-amber-300 dark:border-amber-800"
              : ""
        }
      >
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Storage Usage
            {isStorageCritical && (
              <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Limit Reached
              </Badge>
            )}
            {isStorageWarning && !isStorageCritical && (
              <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                Warning
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span>
              {formatStorageSize(totalStorageUsed)} /{" "}
              {formatStorageSize(STORAGE_LIMIT_BYTES)}
            </span>
            <span className="font-mono">{storagePercent}%</span>
          </div>
          {/* Progress bar */}
          <div className="w-full h-3 bg-[hsl(var(--muted))] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                isStorageCritical
                  ? "bg-red-500"
                  : isStorageWarning
                    ? "bg-amber-500"
                    : "bg-green-500"
              }`}
              style={{ width: `${Math.min(storagePercent, 100)}%` }}
            />
          </div>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            Firebase Spark (free) plan allows 5 GB total. A 1 GB soft limit is
            set to leave headroom for Firestore data and overhead. Images are
            auto-compressed to ~800 KB WebP before upload.
          </p>
          {isStorageCritical && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200 text-sm">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <p>
                Storage limit reached. New file uploads are blocked. Consider
                deleting old files or upgrading to the Blaze plan.
              </p>
            </div>
          )}

          {/* Per-doctor breakdown */}
          <Separator />
          <h3 className="text-sm font-medium">Storage by Doctor</h3>
          <div className="space-y-2">
            {doctors
              .filter((d) => (d.storageUsedBytes ?? 0) > 0)
              .sort(
                (a, b) => (b.storageUsedBytes ?? 0) - (a.storageUsedBytes ?? 0),
              )
              .map((d) => (
                <div
                  key={d.uid}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="truncate max-w-[60%]">
                    {d.displayName || d.email}
                  </span>
                  <span className="font-mono text-[hsl(var(--muted-foreground))]">
                    {formatStorageSize(d.storageUsedBytes ?? 0)}
                  </span>
                </div>
              ))}
            {doctors.every((d) => (d.storageUsedBytes ?? 0) === 0) && (
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                No storage used yet.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Registered Doctors */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Registered Doctors ({doctors.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {doctors.map((d) => (
              <div
                key={d.uid}
                className="flex items-center justify-between py-2 border-b border-[hsl(var(--border))] last:border-0"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">
                      {d.displayName || "Unnamed"}
                    </p>
                    {d.isAdmin && (
                      <Badge
                        variant="outline"
                        className="text-xs text-[hsl(var(--primary))]"
                      >
                        Admin
                      </Badge>
                    )}
                    {d.uid === user?.uid && (
                      <Badge variant="secondary" className="text-xs">
                        You
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    {d.email} · {d.specialization || "No specialization"} ·{" "}
                    {d.hospital || "No hospital"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-[hsl(var(--muted-foreground))]">
                    {formatStorageSize(d.storageUsedBytes ?? 0)}
                  </span>
                  {d.uid !== user?.uid && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleAdmin(d.uid, d.isAdmin === true)}
                    >
                      {d.isAdmin ? "Revoke Admin" : "Make Admin"}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* App Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="h-5 w-5" />
            App Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxFilesPerCase">Max Files Per Case</Label>
              <Input
                id="maxFilesPerCase"
                type="number"
                value={config.maxFilesPerCase ?? 50}
                onChange={(e) =>
                  setConfig((c) => ({
                    ...c,
                    maxFilesPerCase: Number(e.target.value),
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxFileSizeMB">Max File Size (MB)</Label>
              <Input
                id="maxFileSizeMB"
                type="number"
                value={config.maxFileSizeMB ?? 5}
                onChange={(e) =>
                  setConfig((c) => ({
                    ...c,
                    maxFileSizeMB: Number(e.target.value),
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="storageLimitGB">Storage Limit (GB)</Label>
              <Input
                id="storageLimitGB"
                type="number"
                step="0.5"
                value={config.storageLimitGB ?? 1}
                onChange={(e) =>
                  setConfig((c) => ({
                    ...c,
                    storageLimitGB: Number(e.target.value),
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="compressionQuality">
                Image Quality (0.5 - 1.0)
              </Label>
              <Input
                id="compressionQuality"
                type="number"
                step="0.05"
                min="0.5"
                max="1.0"
                value={config.compressionQuality ?? 0.82}
                onChange={(e) =>
                  setConfig((c) => ({
                    ...c,
                    compressionQuality: Number(e.target.value),
                  }))
                }
              />
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Allow New Registrations</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                When disabled, only existing users can sign in.
              </p>
            </div>
            <Button
              variant={config.allowNewRegistrations ? "default" : "outline"}
              size="sm"
              onClick={() =>
                setConfig((c) => ({
                  ...c,
                  allowNewRegistrations: !c.allowNewRegistrations,
                }))
              }
            >
              {config.allowNewRegistrations ? "Enabled" : "Disabled"}
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Maintenance Mode</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                Shows a maintenance banner to all users.
              </p>
            </div>
            <Button
              variant={config.maintenanceMode ? "destructive" : "outline"}
              size="sm"
              onClick={() =>
                setConfig((c) => ({
                  ...c,
                  maintenanceMode: !c.maintenanceMode,
                }))
              }
            >
              {config.maintenanceMode ? "Active" : "Inactive"}
            </Button>
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={handleSaveConfig} disabled={saving}>
              {saving && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              )}
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
