import React from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface FeatureImportanceChartProps {
  featureImportance: Record<string, number> | null | undefined;
  title?: string;
}

// Map backend keys to readable labels (only real features)
const featureLabels: Record<string, string> = {
  pregnancies: "Pregnancies",
  glucose: "Glucose Level",
  bloodPressure: "Blood Pressure",
  skinThickness: "Skin Thickness",
  insulin: "Insulin Level",
  bmi: "Body Mass Index",
  diabetesPedigreeFunction: "Diabetes Pedigree Function",
  age: "Age",
};

// Dynamic gradient coloring based on impact level
function getBarColor(value: number): string {
  if (value >= 60) return "bg-red-500";      // High impact
  if (value >= 30) return "bg-yellow-400";   // Medium impact
  return "bg-green-500";                     // Low impact
}

const FeatureImportanceChart = ({ featureImportance, title = "Feature Importance Analysis" }: FeatureImportanceChartProps) => {
  if (!featureImportance || Object.keys(featureImportance).length === 0) {
    return (
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground">No feature importance data yet.</p>
        </div>
      </Card>
    );
  }

  // Convert to clean numeric array and normalize to 0–100%
  const items = Object.entries(featureImportance)
    .filter(([k]) => k in featureLabels) // show only valid backend features
    .map(([key, value]) => {
      const num = typeof value === "string" ? parseFloat(value) : value;
      return { key, label: featureLabels[key] ?? key, value: Number(num) };
    });

  const maxVal = Math.max(...items.map((i) => i.value));
  const needsScale = maxVal <= 1.5; // if fractional values, convert to %
  const normalized = items.map((i) => ({
    ...i,
    percent: Math.min(100, Math.max(0, needsScale ? i.value * 100 : i.value)),
  }));

  // Sort descending
  const sorted = normalized.sort((a, b) => b.percent - a.percent);

  const topThree = sorted.slice(0, 3);

  return (
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Understanding which factors contributed most to your diabetes risk assessment.
        </p>

        {/* 🏅 Top features pills */}
        <div className="flex flex-wrap gap-2 mb-4">
          {topThree.map((f) => (
            <div
              key={f.key}
              className={`px-3 py-1 rounded-full text-sm font-semibold text-white ${
                f.percent >= 60 ? "bg-red-500" : f.percent >= 30 ? "bg-yellow-400 text-black" : "bg-green-500"
              }`}
            >
              {f.label}: {f.percent.toFixed(1)}%
            </div>
          ))}
        </div>

        {/* 📊 Bars */}
        <div className="space-y-4">
          {sorted.map((f) => (
            <div key={f.key} className="space-y-1">
              <div className="flex justify-between text-sm font-medium">
                <span>{f.label}</span>
                <span className="text-muted-foreground">{f.percent.toFixed(1)}%</span>
              </div>
              <Progress
                value={f.percent}
                className={`h-3 rounded-full ${getBarColor(f.percent)}`}
              />
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
          <strong>Note:</strong> Higher bars indicate greater influence on your diabetes risk score.
          Red = strong impact, Yellow = moderate, Green = minor.
        </div>
      </div>
    </Card>
  );
};

export default FeatureImportanceChart;
