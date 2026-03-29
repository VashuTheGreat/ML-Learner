import { useState, useEffect } from "react";
import mlTrainerApi, {
  AvailableAttributes,
  TrainPayload,
  TrainResult,
} from "@/Services/mlTrainerApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Brain, ChevronRight, Loader2, AlertCircle, TrendingUp, BarChart3, Cpu, FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Local type alias so LS resolves even without @/ path alias ───────────────
type ParamMeta = {
  type: string;
  default: number | boolean | string | null;
  description: string;
};


// ─── Helpers ──────────────────────────────────────────────────────────────────

function castValue(raw: string, type: string): any {
  if (type === "bool") return raw === "true";
  if (type === "int") return raw === "" || raw === "null" ? null : parseInt(raw, 10);
  if (type === "float") return raw === "" || raw === "null" ? null : parseFloat(raw);
  return raw;
}

function defaultStr(def: any): string {
  if (def === null || def === undefined) return "";
  return String(def);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MLTrainer() {
  const [attrs, setAttrs] = useState<AvailableAttributes | null>(null);
  const [loadingAttrs, setLoadingAttrs] = useState(true);
  const [attrsError, setAttrsError] = useState<string | null>(null);

  // form state
  const [taskType, setTaskType] = useState<"regression" | "classification">("regression");
  const [modelName, setModelName] = useState<string>("");
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
        const firstModel =
          taskType === "regression"
            ? data.regression_models[0]
            : data.classification_models[0];
        setModelName(firstModel ?? "");
      })
      .catch((e) => {
        setAttrsError(e?.message ?? "Failed to load model attributes");
        setLoadingAttrs(false);
      });
  }, []);

  // reset model selection when task type changes
  useEffect(() => {
    if (!attrs) return;
    const list =
      taskType === "regression" ? attrs.regression_models : attrs.classification_models;
    setModelName(list[0] ?? "");
    setModelParams({});
  }, [taskType, attrs]);

  const datasetParamsMeta =
    attrs?.[
      taskType === "regression"
        ? "make_regression_params"
        : "make_classification_params"
    ] ?? {};

  // model params are read from model_train_config if present
  const modelParamsMeta: Record<string, any> =
    (attrs?.model_train_config?.[
      taskType === "regression" ? "regression_models" : "classification_models"
    ]?.[modelName]?.default_params ?? {}) as Record<string, any>;

  const handleTrain = async () => {
    if (!modelName) return;
    setTraining(true);
    setResult(null);
    setTrainError(null);

    const resolvedModelParams: Record<string, any> = {};
    Object.entries(modelParamsMeta).forEach(([k, meta]: [string, any]) => {
      const raw = modelParams[k] ?? defaultStr(meta?.default);
      resolvedModelParams[k] = castValue(raw, meta?.type ?? "str");
    });

    const resolvedDatasetParams: Record<string, any> = {};
    Object.entries(datasetParamsMeta).forEach(([k, meta]) => {
      const raw = datasetParams[k] ?? defaultStr(meta.default);
      resolvedDatasetParams[k] = castValue(raw, meta.type);
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

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-transparent text-foreground transition-colors duration-300">
      {/* Header */}
      <div className="relative overflow-hidden bg-secondary/5 border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-6 py-16">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-bg shadow-lg shadow-primary/20">
              <Brain className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight">
                ML Model <span className="gradient-text">Trainer</span>
              </h1>
              <p className="text-muted-foreground mt-1 text-base max-w-lg">
                Interactively train regression & classification models via the Python backend with real-time feedback.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 pb-20 pt-10 space-y-8">
        {/* Loading / Error state */}
        {loadingAttrs && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <span className="text-muted-foreground font-medium animate-pulse">Fetching available models from backend…</span>
          </div>
        )}

        {attrsError && (
          <Card className="border-destructive/30 bg-destructive/5 backdrop-blur-sm">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="h-10 w-10 rounded-full bg-destructive/20 flex items-center justify-center shrink-0">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="font-bold text-destructive">Could not connect to Python backend</p>
                <p className="text-sm text-muted-foreground mt-1 font-medium">{attrsError}</p>
                <div className="flex items-center gap-2 mt-3 p-2 bg-background/50 rounded-lg border border-destructive/10">
                  <span className="text-xs font-bold text-muted-foreground uppercase">Solution:</span>
                  <code className="text-xs text-primary font-mono font-bold">uv run main.py</code>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {attrs && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* ── Left: Config ── */}
            <div className="lg:col-span-2 space-y-8">

              {/* Task Type */}
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-xl rounded-3xl overflow-hidden">
                <CardHeader className="pb-4 bg-secondary/5">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Cpu className="h-5 w-5 text-primary" />
                    Task Type
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {(["regression", "classification"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTaskType(t)}
                        className={`flex-1 rounded-2xl border-2 py-4 px-6 text-sm font-bold transition-all duration-300 transform active:scale-95 ${
                          taskType === t
                            ? "border-primary bg-primary/10 text-primary shadow-lg shadow-primary/10"
                            : "border-border bg-background/50 text-muted-foreground hover:border-primary/50 hover:bg-primary/5"
                        }`}
                      >
                        {t === "regression" ? "📈 Regression" : "🗂️ Classification"}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Model Selection */}
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-xl rounded-3xl overflow-hidden">
                <CardHeader className="pb-4 bg-secondary/5">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FlaskConical className="h-5 w-5 text-primary" />
                    Select Model
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <Select value={modelName} onValueChange={setModelName}>
                    <SelectTrigger className="bg-background border-border h-12 text-base rounded-xl focus:ring-primary/20 transition-all">
                      <SelectValue placeholder="Choose a model…" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border rounded-xl">
                      {(taskType === "regression"
                        ? attrs.regression_models
                        : attrs.classification_models
                      ).map((m) => (
                        <SelectItem
                          key={m}
                          value={m}
                          className="focus:bg-primary/10 transition-colors"
                        >
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Model params from config */}
                  {Object.keys(modelParamsMeta).length > 0 && (
                    <div className="mt-8 space-y-4">
                      <div className="flex items-center gap-3">
                        <Separator className="flex-1" />
                        <p className="text-xs font-black text-muted-foreground uppercase tracking-widest whitespace-nowrap">Model Hyperparameters</p>
                        <Separator className="flex-1" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {Object.entries(modelParamsMeta).map(([key, defaultValue]) => (
                          <div key={key} className="space-y-2">
                            <Label className="text-foreground/80 text-sm font-bold ml-1">
                              {key}{" "}
                              <span className="text-muted-foreground font-normal text-xs uppercase tracking-tighter">({typeof defaultValue})</span>
                            </Label>
                            {typeof defaultValue === "boolean" ? (
                              <Select
                                value={modelParams[key] ?? defaultStr(defaultValue)}
                                onValueChange={(v) =>
                                  setModelParams((p) => ({ ...p, [key]: v }))
                                }
                              >
                                <SelectTrigger className="bg-background border-border h-10 text-sm rounded-xl">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border">
                                  <SelectItem value="true">true</SelectItem>
                                  <SelectItem value="false">false</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <Input
                                className="bg-background border-border h-10 text-sm rounded-xl focus:ring-primary/20 transition-all"
                                placeholder={defaultStr(defaultValue) || "Default"}
                                value={modelParams[key] ?? defaultStr(defaultValue)}
                                onChange={(e) =>
                                  setModelParams((p) => ({ ...p, [key]: e.target.value }))
                                }
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Dataset Params */}
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-xl rounded-3xl overflow-hidden">
                <CardHeader className="pb-4 bg-secondary/5">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Dataset Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(datasetParamsMeta as Record<string, ParamMeta>).map(([key, meta]) => (
                      <div key={key} className="space-y-2">
                        <Label
                          title={meta.description}
                          className="text-foreground/80 text-sm font-bold ml-1 cursor-help flex items-center gap-1.5"
                        >
                          {key}{" "}
                          <span className="text-muted-foreground font-normal text-xs uppercase tracking-tighter">({meta.type})</span>
                        </Label>
                        {meta.type === "bool" ? (
                          <Select
                            value={datasetParams[key] ?? defaultStr(meta.default)}
                            onValueChange={(v) =>
                              setDatasetParams((p) => ({ ...p, [key]: v }))
                            }
                          >
                            <SelectTrigger className="bg-background border-border h-10 text-sm rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border">
                              <SelectItem value="true">true</SelectItem>
                              <SelectItem value="false">false</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            className="bg-background border-border h-10 text-sm rounded-xl focus:ring-primary/20 transition-all"
                            placeholder={defaultStr(meta.default) || "null"}
                            value={datasetParams[key] ?? defaultStr(meta.default)}
                            onChange={(e) =>
                              setDatasetParams((p) => ({ ...p, [key]: e.target.value }))
                            }
                            title={meta.description}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Train Button */}
              <Button
                size="lg"
                onClick={handleTrain}
                disabled={training || !modelName}
                className="w-full btn-primary h-14 rounded-2xl text-lg font-black transition-all duration-300 shadow-xl shadow-primary/20 hover:shadow-primary/40 active:scale-[0.98] disabled:opacity-50"
              >
                {training ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    Training {modelName}…
                  </>
                ) : (
                  <>
                    <Brain className="mr-3 h-6 w-6" />
                    Launch Training Session
                    <ChevronRight className="ml-3 h-5 w-5" />
                  </>
                )}
              </Button>

              {trainError && (
                <Card className="border-destructive/30 bg-destructive/5 backdrop-blur-sm">
                  <CardContent className="flex items-center gap-3 py-4">
                    <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
                    <p className="text-sm font-medium text-destructive">{trainError}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* ── Right: Results + Sidebar ── */}
            <div className="space-y-8 lg:sticky lg:top-24">

              {/* Quick reference */}
              <Card className="border-border/50 bg-card shadow-xl rounded-3xl overflow-hidden">
                <CardHeader className="pb-4 bg-secondary/5">
                  <CardTitle className="text-xs font-black text-muted-foreground uppercase tracking-widest">Available Models</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div>
                    <p className="text-xs font-bold text-primary mb-3 uppercase tracking-tighter">Regression Models</p>
                    <div className="flex flex-wrap gap-2">
                      {attrs.regression_models.map((m) => (
                        <Badge
                          key={m}
                          variant="outline"
                          onClick={() => { setTaskType("regression"); setModelName(m); }}
                          className={cn(
                            "cursor-pointer px-3 py-1 text-xs transition-all duration-300 rounded-lg",
                            taskType === "regression" && modelName === m
                              ? "bg-primary text-white border-primary shadow-md shadow-primary/20 scale-105"
                              : "text-muted-foreground border-border hover:border-primary/50 hover:bg-primary/5"
                          )}
                        >
                          {m}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <Separator />

                  <div>
                    <p className="text-xs font-bold text-accent mb-3 uppercase tracking-tighter">Classification Models</p>
                    <div className="flex flex-wrap gap-2">
                      {attrs.classification_models.map((m) => (
                        <Badge
                          key={m}
                          variant="outline"
                          onClick={() => { setTaskType("classification"); setModelName(m); }}
                          className={cn(
                            "cursor-pointer px-3 py-1 text-xs transition-all duration-300 rounded-lg",
                            taskType === "classification" && modelName === m
                              ? "bg-accent text-white border-accent shadow-md shadow-accent/20 scale-105"
                              : "text-muted-foreground border-border hover:border-accent/50 hover:bg-accent/5"
                          )}
                        >
                          {m}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Training Results */}
              {result && (
                <Card className="border-green-500/30 bg-green-500/5 backdrop-blur-sm shadow-xl rounded-3xl overflow-hidden animate-in slide-in-from-bottom duration-500">
                  <CardHeader className="pb-4 bg-green-500/10">
                    <CardTitle className="text-sm font-black flex items-center gap-2 text-green-600 dark:text-green-400 uppercase tracking-widest">
                      <TrendingUp className="h-5 w-5" />
                      Analysis Results
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="bg-green-500 text-white border-none text-[10px] font-bold">
                        {result.model_name ?? modelName}
                      </Badge>
                      <Badge variant="outline" className="border-green-500/30 text-green-600 dark:text-green-400 text-[10px]">
                        {result.type ?? taskType}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    {/* Metrics */}
                    <div className="space-y-3">
                      {(taskType === "regression"
                        ? ["mae", "mse", "rmse", "r2"]
                        : ["accuracy", "precision", "recall", "f1"]
                      ).map((k) => {
                        const v = result[k];
                        if (v === undefined || v === null) return null;
                        return (
                          <div key={k} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0 hover:bg-primary/5 transition-colors px-2 rounded-lg">
                            <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">{k}</span>
                            <span className="text-sm font-black text-foreground tabular-nums">
                              {typeof v === "number" ? v.toFixed(6) : String(v)}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Plots */}
                    {result.plots && result.plots.length > 0 && (
                      <div className="pt-6 space-y-4">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-primary" />
                          <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Visualizations</p>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                          {result.plots.map((plot, idx) => (
                            <div key={idx} className="rounded-2xl border border-border/50 overflow-hidden bg-muted/30 group">
                              <img
                                src={`data:image/png;base64,${plot}`}
                                alt={`Plot ${idx + 1}`}
                                className="w-full h-auto transition-transform duration-500 group-hover:scale-[1.02]"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Other Keys (excluding metrics and plots) */}
                    {Object.entries(result)
                      .filter(([k]) => !["model_name", "type", "metrics", "plots", "mae", "mse", "rmse", "r2", "accuracy", "precision", "recall", "f1"].includes(k))
                      .map(([k, v]) => (
                        <div key={k} className="py-3 border-b border-border/50 last:border-0 group">
                          <p className="text-[10px] font-black text-muted-foreground uppercase mb-2 tracking-widest group-hover:text-primary transition-colors">{k}</p>
                          <div className="bg-background/80 rounded-xl p-3 border border-border/40">
                             <pre className="text-xs text-foreground/80 whitespace-pre-wrap break-all font-mono leading-relaxed">
                              {typeof v === "object" ? JSON.stringify(v, null, 2) : String(v)}
                            </pre>
                          </div>
                        </div>
                      ))}
                  </CardContent>
                </Card>
              )}

              {!result && !training && (
                <Card className="border-border/40 bg-card/30 border-dashed rounded-3xl">
                  <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-secondary/5 flex items-center justify-center">
                      <Brain className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-muted-foreground">Neural Matrix Ready</p>
                      <p className="text-xs text-muted-foreground/60">Awaiting model configuration and data initialization</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
