import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Brain,
  Sparkles,
} from "lucide-react";
import FeatureImportanceChart from "./FeatureImportanceChart";

interface PredictionResultProps {
  result: {
    prediction: number;
    probability: number;
    riskLevel: string;
    featureImportance: Record<string, number>;
  };
}

const PredictionResult = ({ result }: PredictionResultProps) => {
  const [recommendations, setRecommendations] = useState<string>("");

  const { probability, riskLevel } = result;
  const probText = probability?.toFixed(1) || "—";

  useEffect(() => {
    let msg = `# 🩺 Personalized Health Guidance\n\n`;

    // Content generation based on risk
    if (riskLevel === "High") {
      msg += `
## 🚨 High Risk — Immediate Medical Attention Suggested
You are currently at **high risk of diabetes (${probText}% probability)**. Your results indicate strong warning signals that require prompt action.

### 🔴 Action Plan
**🩸 Medical:**
- Book an appointment for **HbA1c and fasting glucose tests** within the next week.
- Request a **comprehensive metabolic and lipid panel**.

**🥗 Nutrition:**
- Adopt a **low-glycemic, high-fiber diet** — oats, beans, lentils, and leafy greens.
- Avoid sugary drinks and refined carbs (white bread, soda, pastries).
- Include **healthy fats** (nuts, olive oil, avocados).

**🏃 Exercise:**
- Begin moderate activity **30–45 mins/day**, 5 days a week.
- Add **strength training** twice weekly to improve insulin sensitivity.

**💤 Lifestyle:**
- Aim for **7–8 hours of sleep** daily.
- Practice **stress management** — meditation, yoga, or journaling.
- Avoid smoking and excessive alcohol.

> ⚠️ **Your priority:** Medical consultation and sustained glucose management.
`;
    } else if (riskLevel === "Medium") {
      msg += `
## ⚠️ Moderate Risk — Preventive Steps Advised
You have a **moderate risk (${probText}%)** of developing diabetes. Early action can completely prevent progression.

### 🟠 Preventive Strategy
**🥗 Diet:**
- Focus on **portion control** and reduce refined sugars.
- Choose **whole grains, fruits, and lean proteins**.
- Stay hydrated — 2–3L of water daily.

**🏃 Activity:**
- Maintain **150 minutes of weekly exercise** (brisk walk, cycling, or swimming).
- Add light resistance training twice weekly.

**💤 Lifestyle:**
- Sleep 7–8 hours consistently.
- Limit screen time and reduce evening caffeine.
- Track your glucose or blood pressure monthly.

> 🟧 **Your goal:** Maintain balance — small daily habits compound over time.
`;
    } else {
      msg += `
## ✅ Low Risk — Maintain Your Healthy Habits
You are currently at a **low risk (${probText}%)** of diabetes. Excellent job maintaining your health!

### 🟢 Wellness Maintenance
**🥗 Diet:**
- Continue a **balanced diet** rich in fruits, vegetables, and whole grains.
- Keep processed foods and sugary snacks minimal.

**🏃 Exercise:**
- Maintain **daily physical activity** — even short walks count.
- Stretch or move every 45–60 minutes if sedentary.

**💤 Lifestyle:**
- Keep a consistent **sleep routine** and hydration level.
- Schedule annual health check-ups to stay proactive.

> 🌱 **Your focus:** Consistency — prevention is easier than correction.
`;
    }

    // Add Top Influencing Factor
    const topFeature = Object.entries(result.featureImportance).sort(
      (a, b) => b[1] - a[1]
    )[0];
    if (topFeature) {
      msg += `\n### 🎯 Most Influential Factor
**${topFeature[0]}** — improving this will significantly reduce your risk score.`;
    }

    msg += `\n\n💡 *Remember: Sustainable, small changes create lasting health improvements.*`;

    setRecommendations(msg);
  }, [result]);

  const isHighRisk = riskLevel === "High";
  const isMediumRisk = riskLevel === "Medium";

  return (
    <div className="space-y-8">
      {/* Summary Header */}
      <Alert
        className={`rounded-xl shadow-sm border-2 ${
          isHighRisk
            ? "border-red-400 bg-gradient-to-br from-red-50 to-red-100/60"
            : isMediumRisk
            ? "border-yellow-300 bg-gradient-to-br from-yellow-50 to-yellow-100/50"
            : "border-green-400 bg-gradient-to-br from-green-50 to-green-100/60"
        }`}
      >
        {isHighRisk ? (
          <AlertCircle className="h-6 w-6 text-red-600" />
        ) : isMediumRisk ? (
          <TrendingUp className="h-6 w-6 text-yellow-600" />
        ) : (
          <CheckCircle className="h-6 w-6 text-green-600" />
        )}
        <AlertTitle className="text-lg font-bold tracking-tight">
          {riskLevel} Risk —{" "}
          {result.prediction === 1 ? "Diabetic" : "Non-Diabetic"} Prediction
        </AlertTitle>
        <AlertDescription className="mt-1 text-sm">
          Probability of diabetes: <strong>{probText}%</strong>
        </AlertDescription>
      </Alert>

      {/* Feature Chart */}
      <Card className="shadow-sm border border-muted/30 rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Feature Importance
          </CardTitle>
          <CardDescription>
            Key contributors influencing this prediction.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FeatureImportanceChart featureImportance={result.featureImportance} />
        </CardContent>
      </Card>

      {/* Recommendations Section */}
      <Card className="border border-muted/30 shadow-sm rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Personalized Recommendations
          </CardTitle>
          <CardDescription>
            AI-styled actionable insights for your current health status.
          </CardDescription>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none text-sm leading-relaxed text-muted-foreground">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {recommendations}
          </ReactMarkdown>
        </CardContent>
      </Card>

      {/* Footer Note */}
      <div className="text-center text-xs text-muted-foreground mt-6 flex justify-center items-center gap-1">
        <Sparkles className="h-3 w-3" />
        Powered by local AI-style health logic — no external APIs.
      </div>
    </div>
  );
};

export default PredictionResult;
