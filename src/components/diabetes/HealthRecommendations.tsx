import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  HeartPulse,
  Activity,
  Stethoscope,
  AlertTriangle,
} from "lucide-react";

interface HealthRecommendationsProps {
  userId?: string;
  riskLevel: string;
  probability: number;
  metrics: {
    glucose?: number;
    bmi?: number;
    age?: number;
  };
}

const HealthRecommendations = ({
  userId,
  riskLevel,
  probability,
  metrics,
}: HealthRecommendationsProps) => {
  const [trendInsight, setTrendInsight] = useState<string | null>(null);
  const [progressPercent, setProgressPercent] = useState<number | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (userId) fetchHistory();
  }, [userId]);

  // 🧮 Fetch past predictions and detect improvements
  const fetchHistory = async () => {
    const { data, error } = await supabase
      .from("predictions")
      .select("created_at, probability, risk_level, input_data")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(6);

    if (error) {
      console.error("Error fetching history:", error);
      return;
    }
    if (!data?.length) return;

    setHistory(data);

    // Extract recent probabilities
    const probs = data.map((d) => d.probability);
    const trendChange = probs.length > 1 ? probs[probs.length - 1] - probs[0] : 0;
    const improvement = trendChange < 0;

    setProgressPercent(Math.abs(trendChange));

    if (improvement) {
      setTrendInsight(
        `Your diabetes risk has decreased by ${Math.abs(trendChange).toFixed(
          1
        )}% since your first test — great progress! Keep going!`
      );
    } else if (trendChange > 0) {
      setTrendInsight(
        `Your risk has increased by ${trendChange.toFixed(
          1
        )}% since your first test. Let's focus on stabilizing it with better habits.`
      );
    } else {
      setTrendInsight(
        "Your diabetes risk has remained stable — consistency is key! Keep monitoring your lifestyle and stay proactive."
      );
    }
  };

  // 🩺 Basic assessment
  const glucose = metrics.glucose || 0;
  const bmi = metrics.bmi || 0;
  const age = metrics.age || 0;

  const glucoseCategory =
    glucose < 100
      ? "normal fasting glucose"
      : glucose < 126
      ? "prediabetic glucose range"
      : "diabetic glucose range";

  const bmiCategory =
    bmi < 18.5
      ? "underweight"
      : bmi < 25
      ? "healthy weight"
      : bmi < 30
      ? "overweight"
      : "obese";

  const colorMap: Record<string, string> = {
    High: "text-destructive",
    Medium: "text-yellow-500",
    Low: "text-green-500",
  };

  // 🧠 Risk summary tone
  const introText =
    riskLevel === "High"
      ? `You’re at a high diabetes risk (${probability.toFixed(
          1
        )}%). Prioritize lifestyle changes immediately.`
      : riskLevel === "Medium"
      ? `You’re in a moderate risk zone (${probability.toFixed(
          1
        )}%). Small improvements can make a big difference.`
      : `You have a low diabetes risk (${probability.toFixed(
          1
        )}%). Maintain your healthy habits to stay in control.`;

  return (
    <div className="space-y-6">
      {/* 🌟 AI Trend Summary */}
      {trendInsight && (
        <Card className="border-primary/30 shadow-sm bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Brain className="h-5 w-5" />
              Health Insight Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base">{trendInsight}</p>
            {progressPercent !== null && (
              <div className="mt-3">
                <Progress
                  value={Math.min(progressPercent, 100)}
                  className="[&>div]:bg-primary h-2"
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ❤️ AI Overview */}
      <Card className="shadow-md border border-muted">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HeartPulse className="h-5 w-5 text-primary" />
            Personalized Diabetes Prevention Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-4 leading-relaxed">
          <p className="text-base font-medium text-foreground">
            {introText}
          </p>

          <div className="rounded-md p-4 bg-muted/50 border">
            <p>
              <strong className={colorMap[riskLevel]}>
                Risk Level: {riskLevel} ({probability.toFixed(1)}%)
              </strong>{" "}
              — Glucose: <strong>{glucose}</strong> mg/dL ({glucoseCategory}) |
              BMI: <strong>{bmi}</strong> ({bmiCategory}) | Age:{" "}
              <strong>{age}</strong>
            </p>
          </div>

          {/* 🍎 Diet */}
          <div>
            <h3 className="flex items-center gap-2 font-semibold text-lg text-foreground">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              Diet & Nutrition
            </h3>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Emphasize high-fiber foods (vegetables, oats, legumes).</li>
              <li>Limit sugary drinks, refined carbs, and processed snacks.</li>
              <li>Increase lean protein (fish, eggs, lentils) and healthy fats.</li>
              {riskLevel !== "Low" && (
                <li>
                  Consult a nutritionist for a personalized low-GI meal plan.
                </li>
              )}
            </ul>
          </div>

          {/* 🏃 Exercise */}
          <div>
            <h3 className="flex items-center gap-2 font-semibold text-lg text-foreground">
              <Activity className="h-4 w-4 text-blue-500" /> Exercise & Movement
            </h3>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Do at least 150 minutes of moderate activity weekly.</li>
              <li>Include 2–3 sessions of strength training per week.</li>
              <li>Move every 30–60 minutes if sedentary at work.</li>
              {riskLevel === "High" && (
                <li>Start with low-impact activity (yoga, walking) under guidance.</li>
              )}
            </ul>
          </div>

          {/* 🌙 Lifestyle */}
          <div>
            <h3 className="flex items-center gap-2 font-semibold text-lg text-foreground">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Lifestyle & Mindset
            </h3>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Sleep 7–9 hours per night to support metabolic health.</li>
              <li>Practice stress management (meditation, breathing, nature walks).</li>
              <li>Maintain a healthy weight (even 5–7% loss helps lower risk).</li>
            </ul>
          </div>

          {/* 🩺 Medical */}
          <div>
            <h3 className="flex items-center gap-2 font-semibold text-lg text-foreground">
              <Stethoscope className="h-4 w-4 text-primary" />
              Medical Monitoring
            </h3>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Schedule periodic blood glucose and HbA1c tests.</li>
              <li>Monitor cholesterol and blood pressure annually.</li>
              {riskLevel !== "Low" && (
                <li>Discuss medication or insulin sensitivity options with your doctor.</li>
              )}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthRecommendations;
