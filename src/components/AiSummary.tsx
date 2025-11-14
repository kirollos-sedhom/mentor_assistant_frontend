// src/components/AiSummary.tsx

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";
import { Sparkles } from "lucide-react"; // Import icons

// 1. Define the type for the new Rubric item
type RubricItem = {
  score: number;
  justification: string;
};

// 2. Update the main data type
type SummaryData = {
  summary: string; // <-- Renamed from 'performance_summary'
  scores: {
    // <-- Renamed from 'performance_scores'
    [key: string]: RubricItem;
  };
};

// A helper function to format the key
// (e.g., 'suggests_new_ideas' -> 'Suggests New Ideas')
function formatCriterion(key: string) {
  return key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function AiSummary({ tutorId }: { tutorId: string }) {
  const { user } = useAuth();

  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function getSummary() {
    if (!user) return;
    setLoading(true);
    setSummaryData(null); // Clear old summary
    setError("");

    try {
      const token = await user.getIdToken();
      const response = await fetch(
        `https://mentor-assistant-backend.vercel.app/summary/${user.uid}/${tutorId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to fetch summary");
      }

      const data: SummaryData = await response.json();
      setSummaryData(data);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (summaryData) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-200">
        <h3 className="flex items-center gap-2 font-semibold text-blue-700">
          <Sparkles size={16} />
          AI-Generated Summary
        </h3>
        {/* Use 'performance_summary' */}
        <p className="mt-4 text-gray-700 text-sm">{summaryData.summary}</p>

        <h4 className="font-semibold mt-4">Performance Rubric (1-5):</h4>
        <div className="space-y-2 mt-2">
          {/* 4. THIS IS THE FIX:
            We use Object.entries() to map over the object 
          */}
          {summaryData.scores &&
            Object.entries(summaryData.scores).map(([key, item]) => (
              <div key={key} className="text-sm">
                <span className="font-medium">{`[${
                  item.score
                }/5] ${formatCriterion(key)}`}</span>
                <p className="text-gray-600 pl-2">{`- ${item.justification}`}</p>
              </div>
            ))}
        </div>
        <Button
          variant="link"
          size="sm"
          onClick={getSummary}
          className="p-0 mt-4"
        >
          {loading ? "Regenerating..." : "Regenerate"}
        </Button>
      </div>
    );
  }

  // 5. This is the default "button" state
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border flex flex-col items-center gap-2">
      <h3 className="font-semibold">Get an AI Summary</h3>
      <p className="text-sm text-gray-500 text-center">
        Generate a summary of all incidents to identify patterns.
      </p>
      <Button onClick={getSummary} disabled={loading} className="mt-2">
        {loading ? "Generating..." : "Get Summary"}
      </Button>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}
