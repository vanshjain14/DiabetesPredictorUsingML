import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  BarChart3,
  LineChart,
  Brain,
} from "lucide-react";
import { format } from "date-fns";
import {
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

/* =============================== */
/* 🎯 Utility: Compute Feature Averages & Trends */
function computeFeatureStats(rows: any[]) {
  const buckets: Record<string, number[]> = {};

  for (const row of rows) {
    let fi = row.feature_importance;
    if (!fi) continue;

    if (typeof fi === "string") {
      try {
        fi = JSON.parse(fi);
      } catch {
        continue;
      }
    }

    if (typeof fi !== "object" || fi === null) continue;

    const vals = Object.values(fi)
      .map((v: any) => parseFloat(String(v)))
      .filter((v) => !isNaN(v));
    if (!vals.length) continue;

    const max = Math.max(...vals);
    const isFraction = max <= 1.5;

    for (const [key, val] of Object.entries(fi)) {
      let value = parseFloat(String(val));
      if (isNaN(value)) continue;
      value = isFraction ? value * 100 : value;
      value = Math.min(100, Math.max(0, value));
      if (!buckets[key]) buckets[key] = [];
      buckets[key].push(value);
    }
  }

  const averages = Object.entries(buckets).map(([feature, arr]) => {
    const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
    return {
      feature,
      average: Number(avg.toFixed(2)),
    };
  });

  averages.sort((a, b) => b.average - a.average);
  return { averages, buckets };
}

/* 🎨 Fixed colors per feature for readability */
const featureColors: Record<string, string> = {
  glucose: "#ef4444", // red
  bmi: "#3b82f6", // blue
  age: "#10b981", // green
  insulin: "#f59e0b", // amber
  bloodPressure: "#8b5cf6", // violet
  pregnancies: "#ec4899", // pink
  skinThickness: "#14b8a6", // teal
  diabetesPedigreeFunction: "#6366f1", // indigo
};

/* =============================== */

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [riskLevelData, setRiskLevelData] = useState<any[]>([]);
  const [featureAvgData, setFeatureAvgData] = useState<any[]>([]);
  const [featureTrendData, setFeatureTrendData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data, error } = await supabase
        .from("predictions")
        .select("risk_level, created_at, probability, feature_importance")
        .order("created_at", { ascending: true });

      if (error) throw error;
      if (!data || data.length === 0) {
        setIsLoading(false);
        return;
      }

      // ----- Stats -----
      const total = data.length;
      const high = data.filter((d) => d.risk_level === "High").length;
      const medium = data.filter((d) => d.risk_level === "Medium").length;
      const low = data.filter((d) => d.risk_level === "Low").length;

      const trend = data.map((d) => ({
        date: format(new Date(d.created_at), "MMM dd"),
        probability: d.probability,
      }));

      const riskChart = [
        { name: "High Risk", count: high },
        { name: "Medium Risk", count: medium },
        { name: "Low Risk", count: low },
      ];

      const { averages } = computeFeatureStats(data);
      setFeatureAvgData(averages);

      // ----- Feature Impact Over Time -----
      const featureTrend = data.map((d) => {
        const date = format(new Date(d.created_at), "MMM dd");
        let fi = d.feature_importance;
        if (typeof fi === "string") {
          try {
            fi = JSON.parse(fi);
          } catch {
            return null;
          }
        }
        if (!fi) return null;

        const vals = Object.values(fi).map((v: any) => parseFloat(String(v)) || 0);
        const max = Math.max(...vals);
        const isFraction = max <= 1.5;

        const normalized: Record<string, number> = {};
        for (const [key, val] of Object.entries(fi)) {
          let value = parseFloat(String(val));
          if (!isNaN(value)) normalized[key] = isFraction ? value * 100 : value;
        }
        return { date, ...normalized };
      }).filter(Boolean);

      setFeatureTrendData(featureTrend);

      setAnalytics({
        total_predictions: total,
        high_risk_predictions: high,
        medium_risk_predictions: medium,
        low_risk_predictions: low,
      });
      setTrendData(trend);
      setRiskLevelData(riskChart);
    } catch (err) {
      console.error("Error fetching analytics:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analytics Dashboard</CardTitle>
          <CardDescription>No analytics data found</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h2 className="text-3xl font-bold mb-2">Your Analytics Dashboard</h2>
        <p className="text-muted-foreground">
          Visual insights from your diabetes predictions — trends, risks, and key features.
        </p>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Total Predictions",
            icon: <Activity className="h-4 w-4 text-blue-500" />,
            value: analytics.total_predictions,
          },
          {
            title: "High Risk",
            icon: <TrendingUp className="h-4 w-4 text-destructive" />,
            value: analytics.high_risk_predictions,
            color: "text-destructive",
          },
          {
            title: "Medium Risk",
            icon: <TrendingUp className="h-4 w-4 text-yellow-500" />,
            value: analytics.medium_risk_predictions,
            color: "text-yellow-500",
          },
          {
            title: "Low Risk",
            icon: <TrendingDown className="h-4 w-4 text-green-500" />,
            value: analytics.low_risk_predictions,
            color: "text-green-500",
          },
        ].map((card, i) => (
          <Card key={i} className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              {card.icon}
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${card.color || ""}`}>{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* TREND CHART */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-4 w-4 text-blue-500" /> Prediction Trend
          </CardTitle>
          <CardDescription>Diabetes probability across time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ReLineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="probability" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
            </ReLineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* RISK DISTRIBUTION */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-blue-500" /> Risk Distribution
          </CardTitle>
          <CardDescription>Predictions grouped by risk level</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={riskLevelData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* FEATURE IMPACT OVER TIME */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-blue-500" /> Feature Impact Over Time
          </CardTitle>
          <CardDescription>
            Track how each health metric’s importance changes across predictions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ReLineChart data={featureTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              {Object.keys(featureTrendData[0] || {})
                .filter((k) => k !== "date")
                .map((key) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={featureColors[key] || "#8884d8"}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
            </ReLineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* FEATURE IMPORTANCE BAR CHART */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Top Influencing Features (Average)</CardTitle>
          <CardDescription>Average importance across all predictions</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={featureAvgData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="feature" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="average" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
