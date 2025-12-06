import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import PredictionResult from "./PredictionResult";

const predictionSchema = z.object({
  pregnancies: z.coerce.number().min(0).max(20),
  glucose: z.coerce.number().min(0).max(300),
  bloodPressure: z.coerce.number().min(0).max(200),
  skinThickness: z.coerce.number().min(0).max(100),
  insulin: z.coerce.number().min(0).max(900),
  bmi: z.coerce.number().min(0).max(70),
  diabetesPedigreeFunction: z.coerce.number().min(0).max(3),
  age: z.coerce.number().min(1).max(120),
});

type PredictionFormValues = z.infer<typeof predictionSchema>;

interface PredictionResponse {
  prediction: number;
  probability: number;
  riskLevel: string;
  featureImportance: Record<string, number>;
}

const PredictionForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const { toast } = useToast();

  const form = useForm<PredictionFormValues>({
    resolver: zodResolver(predictionSchema),
    defaultValues: {
      pregnancies: 0,
      glucose: 120,
      bloodPressure: 80,
      skinThickness: 20,
      insulin: 80,
      bmi: 25,
      diabetesPedigreeFunction: 0.5,
      age: 30,
    },
  });

  const onSubmit = async (data: PredictionFormValues) => {
    setIsLoading(true);
    setResult(null);

    try {
      // get current user (optional)
      const { data: userData } = await supabase.auth.getUser();
      const user_id = userData?.user?.id || null;

      // call Flask backend
      const response = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, user_id }),
      });

      if (!response.ok) throw new Error("Failed to fetch prediction");
      const predictionData = await response.json();
      setResult(predictionData);

      toast({
        title: "✅ Prediction Complete",
        description: "Your diabetes risk has been assessed successfully.",
      });
    } catch (error) {
      console.error("Prediction error:", error);
      toast({
        variant: "destructive",
        title: "Prediction Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to generate prediction. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Health Assessment Form</CardTitle>
          <CardDescription>
            Enter your health metrics for diabetes risk prediction. All fields
            are required for accurate assessment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  ["pregnancies", "Pregnancies", "Number of times pregnant"],
                  ["glucose", "Glucose (mg/dL)", "Plasma glucose concentration"],
                  ["bloodPressure", "Blood Pressure (mm Hg)", "Diastolic blood pressure"],
                  ["skinThickness", "Skin Thickness (mm)", "Triceps skin fold thickness"],
                  ["insulin", "Insulin (μU/mL)", "2-Hour serum insulin"],
                  ["bmi", "BMI", "Body mass index"],
                  ["diabetesPedigreeFunction", "Diabetes Pedigree Function", "Family history score"],
                  ["age", "Age (years)", "Your age in years"],
                ].map(([name, label, desc]) => (
                  <FormField
                    key={name}
                    control={form.control}
                    name={name as keyof PredictionFormValues}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{label}</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormDescription>{desc}</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Predict Diabetes Risk"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && <PredictionResult result={result} />}
    </div>
  );
};

export default PredictionForm;
