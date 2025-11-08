// src/components/AddIncidentForm.tsx
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { addIncident } from "../services/tutorService";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";

// 1. Import the new components
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  tutorId: string;
  onSuccess?: () => void;
};

export default function AddIncidentForm({ tutorId, onSuccess }: Props) {
  const { user } = useAuth();
  const [incidentDescription, setIncidentDescription] = useState<string>("");
  const [incidentDate, setIncidentDate] = useState<Date | undefined>(undefined);
  const [incidentTime, setIncidentTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // ... (your handleAddIncident function is perfect)

  async function handleAddIncident(e: React.FormEvent) {
    e.preventDefault();
    if (
      !user ||
      !incidentDescription.trim() ||
      !incidentDate ||
      !incidentTime
    ) {
      setError("Please fill out all fields.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const datePart = incidentDate.toISOString().split("T")[0];
      const combinedDateTime = new Date(`${datePart}T${incidentTime}`);
      await addIncident(
        user.uid,
        tutorId.trim(),
        incidentDescription,
        combinedDateTime
      );
      setIncidentDescription("");
      setIncidentDate(undefined);
      setIncidentTime("");
      onSuccess?.();
    } catch (error) {
      if (error instanceof Error) setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    // 2. Add 'space-y-4' for better spacing
    <form onSubmit={handleAddIncident} className="flex flex-col space-y-4 w-80">
      {/* 3. Use the shadcn Textarea */}
      <div className="space-y-1">
        <Label htmlFor="incident">Incident</Label>
        <Textarea
          id="incident"
          placeholder="What happened?"
          rows={4}
          value={incidentDescription}
          required
          onChange={(e) => setIncidentDescription(e.target.value)}
        />
      </div>

      <div className="flex gap-2 w-full">
        <div className="w-1/2 space-y-1">
          <Label>Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              {/* This Button code is now correct */}
              <Button
  variant="outline"
  className={cn(
    "w-full justify-start text-left font-normal bg-background overflow-hidden truncate",
    !incidentDate && "text-muted-foreground"
  )}
>
  <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
  {incidentDate ? format(incidentDate, "PPP") : <span>Pick a date</span>}
</Button>
            </PopoverTrigger>
            {/* 4. FIX THE Z-INDEX BUG (z-50 is shadcn default) */}
            <PopoverContent
  className="w-auto p-0 bg-white dark:bg-white border border-border shadow-lg rounded-md z-[9999]"
  sideOffset={4}
  align="start"
>
  <Calendar
    mode="single"
    selected={incidentDate}
    onSelect={setIncidentDate}
    initialFocus
  />
</PopoverContent>
          </Popover>
        </div>
        {/* 5. Use the shadcn Input for Time */}
        <div className="w-1/2 space-y-1">
          <Label htmlFor="time">Time</Label>

          <Input
            type="time"
            id="time"
            value={incidentTime}
            onChange={(e) => setIncidentTime(e.target.value)}
            required
          />
        </div>
      </div>
      {/* 6. Use the shadcn Button for submission */}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Remembering..." : "Record Incident"}
      </Button>
      {error && <p className="text-red-500">{error}</p>}
    </form>
  );
}
