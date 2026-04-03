import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { VitalsRecord } from "@/lib/types";
import type { Timestamp } from "firebase/firestore";
import { formatDate } from "@/lib/utils";

interface Props {
  vitals: VitalsRecord[];
}

export function VitalsChart({ vitals }: Props) {
  if (vitals.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12 text-[hsl(var(--muted-foreground))]">
          <p className="text-lg font-medium">No vitals recorded yet</p>
          <p className="mt-1 text-sm">
            Add vitals via timeline entries or the vitals form to see trends
            here.
          </p>
        </CardContent>
      </Card>
    );
  }

  const chartData = vitals.map((v) => ({
    date: v.recordedAt ? formatDate((v.recordedAt as Timestamp).toDate()) : "",
    systolic: v.bloodPressureSystolic,
    diastolic: v.bloodPressureDiastolic,
    pulse: v.pulse,
    temperature: v.temperature,
    spO2: v.spO2,
    weight: v.weight,
  }));

  const hasBP = vitals.some(
    (v) => v.bloodPressureSystolic || v.bloodPressureDiastolic,
  );
  const hasPulse = vitals.some((v) => v.pulse);
  const hasTemp = vitals.some((v) => v.temperature);
  const hasSpO2 = vitals.some((v) => v.spO2);

  return (
    <div className="space-y-6">
      {hasBP && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Blood Pressure</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} domain={["auto", "auto"]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="systolic"
                  name="Systolic"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="diastolic"
                  name="Diastolic"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {hasPulse && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pulse (bpm)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="pulse"
                  name="Pulse"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {hasSpO2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">SpO2 (%)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} domain={[85, 100]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="spO2"
                  name="SpO2"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {hasTemp && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Temperature</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="temperature"
                  name="Temperature"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
