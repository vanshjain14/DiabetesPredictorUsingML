import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Clock, TrendingUp, TrendingDown } from "lucide-react";

interface Prediction {
  id: string;
  created_at: string;
  input_data: {
    glucose?: number;
    bmi?: number;
    age?: number;
  } | string;
  prediction: number;
  probability: number;
  risk_level: string;
}

const PredictionHistory = () => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPredictions();
  }, []);

  const fetchPredictions = async () => {
    try {
      const { data, error } = await supabase
        .from("predictions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      const parsed = data.map((p: any) => ({
        ...p,
        input_data:
          typeof p.input_data === "string" ? JSON.parse(p.input_data) : p.input_data,
      }));

      setPredictions(parsed);
    } catch (error) {
      console.error("Error fetching predictions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "High":
        return "bg-red-100 text-red-700";
      case "Medium":
        return "bg-yellow-100 text-yellow-700";
      case "Low":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case "High":
        return <TrendingUp className="h-4 w-4 text-red-600" />;
      case "Medium":
        return <TrendingUp className="h-4 w-4 text-yellow-500" />;
      case "Low":
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Prediction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (predictions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Prediction History</CardTitle>
          <CardDescription>
            Your past diabetes risk assessments will appear here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No predictions yet. Complete your first assessment to get started.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prediction History</CardTitle>
        <CardDescription>
          Your recent diabetes risk assessments (last 10 predictions)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {predictions.map((prediction) => {
            const input = prediction.input_data as Record<string, number>;
            const riskColor = getRiskColor(prediction.risk_level);

            return (
              <div
                key={prediction.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge className={`${riskColor} font-medium px-3 py-1`}>
                      {prediction.risk_level} Risk
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {format(
                        new Date(prediction.created_at),
                        "MMM dd, yyyy 'at' h:mm a"
                      )}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Glucose: {input.glucose ?? "N/A"} mg/dL | BMI: {input.bmi ?? "N/A"} | Age:{" "}
                    {input.age ?? "N/A"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    {getRiskIcon(prediction.risk_level)}
                    <span
                      className={`text-2xl font-bold ${
                        prediction.risk_level === "High"
                          ? "text-red-600"
                          : prediction.risk_level === "Medium"
                          ? "text-yellow-600"
                          : "text-green-600"
                      }`}
                    >
                      {prediction.probability.toFixed(2)}%
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">Probability</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default PredictionHistory;
