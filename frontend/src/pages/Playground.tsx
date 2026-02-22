import { useState, useEffect } from "react";
import mlTrainerApi, {
  AvailableAttributes,
  TrainPayload,
  TrainResult,
  DatasetParamMeta,
} from "@/Services/mlTrainerApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Brain,
  ChevronRight,
  Loader2,
  AlertCircle,
  BarChart3,
  Cpu,
  FlaskConical,
  Dna,
  Zap,
  Layers,
  Sparkles,
  TrendingUp,
  Target,
  Activity,
  Sigma,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { cn } from "@/lib/utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function defaultStr(val: any): string {
  if (val === null || val === undefined) return "";
  return String(val);
}

/** Infer type from a default value for smart casting */
function inferType(val: any): "bool" | "int" | "float" | "str" {
  if (typeof val === "boolean") return "bool";
  if (typeof val === "number") {
    return Number.isInteger(val) ? "int" : "float";
  }
  return "str";
}

/** Cast the string input back to the right JS type before sending to API */
function castParam(raw: string, defaultVal: any): any {
  const t = inferType(defaultVal);
  if (t === "bool") return raw === "true";
  if (t === "int") return raw === "" || raw === "null" ? null : parseInt(raw, 10);
  if (t === "float") return raw === "" || raw === "null" ? null : parseFloat(raw);
  // str: send null for empty/none
  if (raw === "" || raw.toLowerCase() === "none" || raw.toLowerCase() === "null") return null;
  return raw;
}

// ─── Metric metadata for nice display ─────────────────────────────────────────

const METRIC_META: Record<string, { label: string; icon: React.ElementType; color: string; description: string }> = {
  mae:       { label: "MAE",       icon: Activity,   color: "text-orange-600", description: "Mean Absolute Error" },
  mse:       { label: "MSE",       icon: Sigma,      color: "text-red-600",    description: "Mean Squared Error" },
  rmse:      { label: "RMSE",      icon: TrendingUp, color: "text-purple-600", description: "Root Mean Squared Error" },
  r2:        { label: "R² Score",  icon: Target,     color: "text-emerald-600",description: "Coefficient of Determination" },
  accuracy:  { label: "Accuracy",  icon: Target,     color: "text-emerald-600",description: "Overall Accuracy" },
  precision: { label: "Precision", icon: Activity,   color: "text-blue-600",   description: "Weighted Precision" },
  recall:    { label: "Recall",    icon: TrendingUp, color: "text-violet-600", description: "Weighted Recall" },
  f1:        { label: "F1 Score",  icon: Sigma,      color: "text-rose-600",   description: "Weighted F1 Score" },
};

const REGRESSION_METRICS = ["mae", "mse", "rmse", "r2"];
const CLASSIFICATION_METRICS = ["accuracy", "precision", "recall", "f1"];

// ─── Component ────────────────────────────────────────────────────────────────

export default function Playground() {
  const [attrs, setAttrs] = useState<AvailableAttributes | null>(null);
  const [loadingAttrs, setLoadingAttrs] = useState(true);
  const [attrsError, setAttrsError] = useState<string | null>(null);

  // form state
  const [taskType, setTaskType] = useState<"regression" | "classification">("regression");
  const [modelName, setModelName] = useState<string>("");
  /** Stores user-edited overrides for model params (string form) */
  const [modelParams, setModelParams] = useState<Record<string, string>>({});
  const [datasetParams, setDatasetParams] = useState<Record<string, string>>({});

  // training state
  const [training, setTraining] = useState(false);
  const [result, setResult] = useState<TrainResult | null>(null);
  const [trainError, setTrainError] = useState<string | null>(null);

  useEffect(() => {
    mlTrainerApi
      .getAvailableAttributes()
      .then((data) => {
        setAttrs(data);
        setLoadingAttrs(false);
        const firstModel = data.regression_models[0] ?? "";
        setModelName(firstModel);
      })
      .catch((e) => {
        setAttrsError(e?.message ?? "Failed to load model attributes");
        setLoadingAttrs(false);
      });
  }, []);

  // Reset model & params when task type changes
  useEffect(() => {
    if (!attrs) return;
    const list = taskType === "regression" ? attrs.regression_models : attrs.classification_models;
    setModelName(list[0] ?? "");
    setModelParams({});
    setResult(null);
  }, [taskType, attrs]);

  // Reset params when model changes
  useEffect(() => {
    setModelParams({});
  }, [modelName]);

  const datasetParamsMeta =
    attrs?.[taskType === "regression" ? "make_regression_params" : "make_classification_params"] ?? {};

  /** The default_params for the selected model (flat key→value) */
  const modelDefaultParams: Record<string, any> =
    attrs?.model_train_config?.[
      taskType === "regression" ? "regression_models" : "classification_models"
    ]?.[modelName]?.default_params ?? {};

  const handleTrain = async () => {
    if (!modelName) return;
    setTraining(true);
    setResult(null);
    setTrainError(null);

    // Build model params — only send actual values, not descriptions
    const resolvedModelParams: Record<string, any> = {};
    Object.entries(modelDefaultParams).forEach(([k, defaultVal]) => {
      const raw = modelParams[k] ?? defaultStr(defaultVal);
      resolvedModelParams[k] = castParam(raw, defaultVal);
    });

    // Build dataset params — only send actual values, not descriptions
    const resolvedDatasetParams: Record<string, any> = {};
    Object.entries(datasetParamsMeta).forEach(([k, meta]) => {
      const raw = datasetParams[k] ?? defaultStr((meta as DatasetParamMeta).default);
      // Cast based on type from meta
      const t = (meta as DatasetParamMeta).type;
      if (t === "bool") resolvedDatasetParams[k] = raw === "true";
      else if (t === "int") resolvedDatasetParams[k] = raw === "" || raw === "null" ? null : parseInt(raw, 10);
      else if (t === "float") resolvedDatasetParams[k] = raw === "" || raw === "null" ? null : parseFloat(raw);
      else resolvedDatasetParams[k] = raw === "" || raw.toLowerCase() === "none" ? null : raw;
    });

    const payload: TrainPayload = {
      model_name: modelName,
      model_params: resolvedModelParams,
      type: taskType,
      make_dataset: resolvedDatasetParams,
    };

    try {
      const res = await mlTrainerApi.trainModel(payload);
      setResult(res);
    } catch (e: any) {
      setTrainError(
        e?.response?.data?.detail ?? e?.message ?? "Training failed. Check that the Python backend is running."
      );
    } finally {
      setTraining(false);
    }
  };

  const metricKeys = taskType === "regression" ? REGRESSION_METRICS : CLASSIFICATION_METRICS;

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />

      {/* Hero Section */}
      <div className="relative pt-32 pb-16 px-6 overflow-hidden bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px] -z-10" />

        <div className="mx-auto max-w-7xl relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-6 animate-in fade-in slide-in-from-left duration-700">
              <Badge variant="outline" className="px-4 py-1.5 border-primary/30 text-primary bg-primary/5">
                <Sparkles className="w-3.5 h-3.5 mr-2" />
                AI Lab Environment 2.0
              </Badge>
              <div className="space-y-2">
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900">
                  ML <span className="gradient-text">Playground</span>
                </h1>
                <p className="text-slate-500 max-w-2xl text-lg md:text-xl font-medium leading-relaxed">
                  Design, train, and evaluate machine learning models in real-time.
                  Tune hyperparameters and instantly see metrics + visualizations.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-lg animate-in fade-in slide-in-from-right duration-700">
              <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors group">
                <div className="w-10 h-10 rounded-lg bg-cyan-50 flex items-center justify-center border border-cyan-200 group-hover:scale-110 transition-transform">
                  <Cpu className="w-5 h-5 text-cyan-600" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Engine</p>
                  <p className="text-sm font-bold text-slate-800">Python 3.11</p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors group">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center border border-emerald-200 group-hover:scale-110 transition-transform">
                  <Zap className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Status</p>
                  <p className="text-sm font-bold text-emerald-600 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Connected
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 pb-20 pt-8">
        {loadingAttrs && (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Dna className="h-12 w-12 text-primary animate-spin" />
            <p className="text-slate-500 font-medium">Initializing Neural Pathways...</p>
          </div>
        )}

        {attrsError && (
          <Card className="border-red-200 bg-red-50 animate-in fade-in slide-in-from-bottom-4">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center border border-red-200">
                <AlertCircle className="h-6 w-6 text-red-500" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-red-700">Backend Connection Error</p>
                <p className="text-sm text-slate-600 mt-1">{attrsError}</p>
                <div className="mt-3 flex items-center gap-2 text-[10px] font-mono p-2 bg-slate-100 rounded border border-slate-200">
                  <span className="text-slate-400">$</span>
                  <span className="text-cyan-700">uvicorn src.app:app --reload --port 8000</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {attrs && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* ── Configuration Sidebar ── */}
            <div className="lg:col-span-4 space-y-6">
              <div className="sticky top-24 space-y-6">

                {/* Mode Selector */}
                <Card className="border-slate-200 bg-white shadow-md overflow-hidden transition-all duration-300 hover:border-primary/40 hover:shadow-lg">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
                  <CardHeader className="pb-4">
                    <CardTitle className="text-sm uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2 font-black">
                      <Layers className="w-4 h-4 text-primary" />
                      Learning Mode
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex gap-3">
                    {(["regression", "classification"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTaskType(t)}
                        className={cn(
                          "flex-1 rounded-xl border py-4 px-2 text-xs font-black uppercase tracking-widest transition-all duration-300",
                          taskType === t
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300 hover:text-slate-700"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </CardContent>
                </Card>

                {/* Model Configuration */}
                <Card className="border-slate-200 bg-white shadow-md transition-all duration-300 hover:border-primary/40 hover:shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-sm uppercase tracking-[0.2em] text-slate-600 font-black">
                      Model Configuration
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400 font-medium">
                      Select algorithm and tune hyperparameters
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Algorithm picker */}
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase tracking-[0.25em] text-primary font-black">Algorithm</Label>
                      <Select value={modelName} onValueChange={setModelName}>
                        <SelectTrigger className="bg-white border-slate-300 text-slate-800 rounded-xl h-12 focus:ring-primary/20 hover:border-slate-400 transition-colors">
                          <SelectValue placeholder="Choose a model…" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-200 text-slate-800 max-h-72">
                          {(taskType === "regression"
                            ? attrs.regression_models
                            : attrs.classification_models
                          ).map((m) => (
                            <SelectItem key={m} value={m} className="focus:bg-primary/10 py-3 cursor-pointer">
                              {m}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Hyperparameters from default_params */}
                    {Object.keys(modelDefaultParams).length > 0 && (
                      <div className="space-y-4 pt-4 border-t border-slate-100">
                        <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400 font-black">
                          Hyperparameters
                        </p>
                        <div className="grid grid-cols-1 gap-3 max-h-80 overflow-y-auto pr-1">
                          {Object.entries(modelDefaultParams).map(([key, defaultVal]) => {
                            const isBool = typeof defaultVal === "boolean" ||
                              (typeof defaultVal === "string" && (defaultVal === "True" || defaultVal === "False"));
                            const currentVal = modelParams[key] ?? defaultStr(defaultVal);
                            return (
                              <div key={key} className="space-y-1.5">
                                <div className="flex justify-between items-center">
                                  <Label className="text-xs text-slate-700 font-bold">
                                    {key}
                                  </Label>
                                  <Badge variant="secondary" className="text-[9px] font-bold bg-slate-100 text-slate-500 uppercase tracking-wide">
                                    {inferType(defaultVal)}
                                  </Badge>
                                </div>
                                {isBool ? (
                                  <Select
                                    value={currentVal}
                                    onValueChange={(v) => setModelParams((p) => ({ ...p, [key]: v }))}
                                  >
                                    <SelectTrigger className="bg-white border-slate-300 text-slate-800 h-10 text-xs rounded-xl hover:border-slate-400 transition-colors">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border-slate-200">
                                      <SelectItem value="true">True</SelectItem>
                                      <SelectItem value="false">False</SelectItem>
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <Input
                                    className="bg-white border-slate-300 text-slate-800 h-10 text-xs rounded-xl focus:ring-primary/20 hover:border-slate-400 transition-colors"
                                    placeholder={defaultStr(defaultVal) || "None"}
                                    value={currentVal}
                                    onChange={(e) => setModelParams((p) => ({ ...p, [key]: e.target.value }))}
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Train Button */}
                <Button
                  size="lg"
                  onClick={handleTrain}
                  disabled={training || !modelName}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-black h-16 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-primary/30 disabled:opacity-50 group active:scale-95"
                >
                  {training ? (
                    <>
                      <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                      <span className="tracking-widest uppercase text-sm">Training...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="mr-3 h-5 w-5 fill-current transition-transform group-hover:scale-125 group-hover:rotate-12" />
                      <span className="tracking-widest uppercase text-sm">Train Model</span>
                      <ChevronRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* ── Results Main Area ── */}
            <div className="lg:col-span-8 space-y-8">

              {/* Dataset Params Card */}
              <Card className="border-slate-200 bg-white shadow-md transition-all duration-300 hover:border-primary/40 hover:shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="text-sm uppercase tracking-[0.2em] text-slate-600 flex items-center gap-2 font-black">
                    <BarChart3 className="w-4 h-4 text-cyan-600" />
                    Dataset Parameters
                    <Badge variant="secondary" className="ml-auto text-[9px] bg-cyan-50 text-cyan-700 border border-cyan-200 uppercase tracking-wide font-bold">
                      {taskType}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">
                    Configure synthetic dataset generation via sklearn's <code className="bg-slate-100 px-1 rounded">make_{taskType}</code>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(datasetParamsMeta as Record<string, DatasetParamMeta>).map(([key, meta]) => (
                      <div key={key} className="space-y-1.5 group/data">
                        <Label
                          className="text-[10px] text-slate-500 font-black uppercase tracking-widest truncate block group-hover/data:text-cyan-600 transition-colors cursor-help"
                          title={meta.description}
                        >
                          {key}
                        </Label>
                        <Input
                          className="bg-white border-slate-300 text-slate-800 h-10 text-xs rounded-xl text-center focus:ring-primary/20 hover:border-slate-400 transition-all font-bold"
                          value={datasetParams[key] ?? defaultStr(meta.default)}
                          onChange={(e) => setDatasetParams((p) => ({ ...p, [key]: e.target.value }))}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Error Message */}
              {trainError && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3 items-start animate-in zoom-in-95">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 font-medium">{trainError}</p>
                </div>
              )}

              {/* Results */}
              {result ? (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">

                  {/* Metrics header */}
                  <div className="flex items-center gap-3">
                    <Brain className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-black text-slate-800 tracking-tight">
                      {modelName} — Performance Metrics
                    </h2>
                    <Badge className="ml-auto bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold uppercase tracking-wide">
                      {taskType}
                    </Badge>
                  </div>

                  {/* Metric cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {metricKeys.map((k) => {
                      const val = result[k];
                      if (val === undefined || val === null) return null;
                      const meta = METRIC_META[k];
                      const Icon = meta?.icon ?? Activity;
                      return (
                        <Card key={k} className="bg-white border-slate-200 shadow-sm relative overflow-hidden group hover:border-primary/40 hover:shadow-md transition-all duration-300">
                          <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full blur-2xl -mr-8 -mt-8" />
                          <CardHeader className="p-4 pb-2">
                            <div className="flex items-center gap-1.5">
                              <Icon className={cn("w-3.5 h-3.5", meta?.color ?? "text-slate-400")} />
                              <CardTitle className="text-[10px] uppercase font-black tracking-widest text-slate-400">
                                {meta?.label ?? k}
                              </CardTitle>
                            </div>
                          </CardHeader>
                          <CardContent className="p-4 pt-0">
                            <p className={cn("text-2xl font-black tracking-tighter", meta?.color ?? "text-slate-900")}>
                              {typeof val === "number" ? val.toFixed(4) : String(val)}
                            </p>
                            {meta?.description && (
                              <p className="text-[10px] text-slate-400 mt-0.5">{meta.description}</p>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  {/* Plots */}
                  {result.plots && result.plots.length > 0 && (
                    <>
                      <div className="flex items-center gap-3">
                        <BarChart3 className="w-5 h-5 text-cyan-600" />
                        <h2 className="text-lg font-black text-slate-800 tracking-tight">Visualizations</h2>
                        <span className="text-xs text-slate-400 ml-auto">{result.plots.length} plot{result.plots.length > 1 ? "s" : ""}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {result.plots.map((plot, idx) => (
                          <Card key={idx} className="border-slate-200 bg-white overflow-hidden group shadow-md hover:border-primary/40 hover:shadow-lg transition-all duration-500">
                            <CardHeader className="bg-slate-50 border-b border-slate-100 p-4">
                              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center justify-between">
                                <span>Plot {idx + 1}</span>
                                <div className="w-2 h-2 rounded-full bg-primary" />
                              </CardTitle>
                            </CardHeader>
                            <div className="relative flex items-center justify-center p-4 bg-white group-hover:bg-slate-50 transition-colors duration-500">
                              <img
                                src={`data:image/png;base64,${plot}`}
                                alt={`Visualization ${idx + 1}`}
                                className="max-w-full rounded-lg shadow-sm group-hover:scale-[1.02] transition-transform duration-500"
                              />
                            </div>
                          </Card>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                /* Empty state */
                <div className="h-[500px] border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center space-y-6 bg-slate-50 animate-in fade-in zoom-in-95 duration-700">
                  <div className="h-24 w-24 rounded-3xl bg-white border border-slate-200 flex items-center justify-center shadow-md">
                    <FlaskConical className="h-10 w-10 text-primary" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">Playground Ready</h3>
                    <p className="max-w-xs text-slate-500 font-medium leading-relaxed">
                      Select a model, tune parameters, and click
                      <span className="text-primary font-extrabold"> "Train Model" </span>
                      to see results.
                    </p>
                  </div>
                  {/* Hint chips */}
                  <div className="flex gap-2 flex-wrap justify-center">
                    {metricKeys.map((k) => {
                      const meta = METRIC_META[k];
                      return (
                        <span key={k} className="text-[10px] bg-white border border-slate-200 text-slate-500 font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                          {meta?.label ?? k}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
