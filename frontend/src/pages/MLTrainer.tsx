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
  const modelParamsMeta: Record<string, ParamMeta> =
    (attrs?.model_train_config?.[
      taskType === "regression" ? "regression_models" : "classification_models"
    ]?.[modelName]?.params ?? {}) as Record<string, ParamMeta>;

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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 via-cyan-500/10 to-violet-600/20 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-6 py-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-violet-300 via-cyan-300 to-violet-300 bg-clip-text text-transparent">
                ML Model Trainer
              </h1>
              <p className="text-slate-400 mt-1 text-sm">
                Interactively train regression &amp; classification models via the Python backend
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 pb-20 space-y-8">
        {/* Loading / Error state */}
        {loadingAttrs && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-violet-400 mr-3" />
            <span className="text-slate-400">Fetching available models from backend…</span>
          </div>
        )}

        {attrsError && (
          <Card className="border-red-500/30 bg-red-950/20">
            <CardContent className="flex items-center gap-3 pt-6">
              <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
              <div>
                <p className="font-medium text-red-300">Could not connect to Python backend</p>
                <p className="text-sm text-slate-400 mt-1">{attrsError}</p>
                <p className="text-xs text-slate-500 mt-1">
                  Make sure the Python backend is running: <code className="text-cyan-400">uvicorn src.app:app --reload --port 8000</code>
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {attrs && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ── Left: Config ── */}
            <div className="lg:col-span-2 space-y-6">

              {/* Task Type */}
              <Card className="border-slate-800/60 bg-slate-900/60 backdrop-blur">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base flex items-center gap-2 text-slate-200">
                    <Cpu className="h-4 w-4 text-cyan-400" />
                    Task Type
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3">
                    {(["regression", "classification"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTaskType(t)}
                        className={`flex-1 rounded-lg border py-3 px-4 text-sm font-medium transition-all duration-200 ${
                          taskType === t
                            ? "border-violet-500 bg-violet-500/10 text-violet-300"
                            : "border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600"
                        }`}
                      >
                        {t === "regression" ? "📈 Regression" : "🗂️ Classification"}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Model Selection */}
              <Card className="border-slate-800/60 bg-slate-900/60 backdrop-blur">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base flex items-center gap-2 text-slate-200">
                    <FlaskConical className="h-4 w-4 text-violet-400" />
                    Select Model
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={modelName} onValueChange={setModelName}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200">
                      <SelectValue placeholder="Choose a model…" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {(taskType === "regression"
                        ? attrs.regression_models
                        : attrs.classification_models
                      ).map((m) => (
                        <SelectItem
                          key={m}
                          value={m}
                          className="text-slate-200 focus:bg-slate-700"
                        >
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Model params from config */}
                  {Object.keys(modelParamsMeta).length > 0 && (
                    <div className="mt-4 space-y-3">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Model Hyperparameters</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {Object.entries(modelParamsMeta).map(([key, meta]) => (
                          <div key={key} className="space-y-1">
                            <Label className="text-slate-400 text-xs">
                              {key}{" "}
                              <span className="text-slate-600">({meta?.type ?? "any"})</span>
                            </Label>
                            {meta?.type === "bool" ? (
                              <Select
                                value={modelParams[key] ?? defaultStr(meta?.default)}
                                onValueChange={(v) =>
                                  setModelParams((p) => ({ ...p, [key]: v }))
                                }
                              >
                                <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200 h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700">
                                  <SelectItem value="true" className="text-slate-200 text-xs">true</SelectItem>
                                  <SelectItem value="false" className="text-slate-200 text-xs">false</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <Input
                                className="bg-slate-800 border-slate-700 text-slate-200 h-8 text-xs"
                                placeholder={defaultStr(meta?.default) || "leave blank for default"}
                                value={modelParams[key] ?? defaultStr(meta?.default)}
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
              <Card className="border-slate-800/60 bg-slate-900/60 backdrop-blur">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base flex items-center gap-2 text-slate-200">
                    <BarChart3 className="h-4 w-4 text-cyan-400" />
                    Dataset Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(datasetParamsMeta as Record<string, ParamMeta>).map(([key, meta]) => (
                      <div key={key} className="space-y-1">
                        <Label
                          title={meta.description}
                          className="text-slate-400 text-xs cursor-help"
                        >
                          {key}{" "}
                          <span className="text-slate-600">({meta.type})</span>
                        </Label>
                        {meta.type === "bool" ? (
                          <Select
                            value={datasetParams[key] ?? defaultStr(meta.default)}
                            onValueChange={(v) =>
                              setDatasetParams((p) => ({ ...p, [key]: v }))
                            }
                          >
                            <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200 h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700">
                              <SelectItem value="true" className="text-slate-200 text-xs">true</SelectItem>
                              <SelectItem value="false" className="text-slate-200 text-xs">false</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            className="bg-slate-800 border-slate-700 text-slate-200 h-8 text-xs"
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
                className="w-full bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-semibold h-12 rounded-xl transition-all duration-300 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 disabled:opacity-50"
              >
                {training ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Training {modelName}…
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-4 w-4" />
                    Train Model
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              {trainError && (
                <Card className="border-red-500/30 bg-red-950/20">
                  <CardContent className="flex items-center gap-3 pt-4 pb-4">
                    <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                    <p className="text-sm text-red-300">{trainError}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* ── Right: Results + Sidebar ── */}
            <div className="space-y-6">

              {/* Quick reference */}
              <Card className="border-slate-800/60 bg-slate-900/60 backdrop-blur">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-slate-400 uppercase tracking-wider">Available Models</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-violet-400 mb-2">Regression</p>
                    <div className="flex flex-wrap gap-1.5">
                      {attrs.regression_models.map((m) => (
                        <Badge
                          key={m}
                          variant="outline"
                          onClick={() => { setTaskType("regression"); setModelName(m); }}
                          className={`cursor-pointer text-xs border-slate-700 transition-colors ${
                            taskType === "regression" && modelName === m
                              ? "border-violet-500 bg-violet-500/10 text-violet-300"
                              : "text-slate-400 hover:border-slate-500"
                          }`}
                        >
                          {m}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Separator className="bg-slate-800" />
                  <div>
                    <p className="text-xs font-medium text-cyan-400 mb-2">Classification</p>
                    <div className="flex flex-wrap gap-1.5">
                      {attrs.classification_models.map((m) => (
                        <Badge
                          key={m}
                          variant="outline"
                          onClick={() => { setTaskType("classification"); setModelName(m); }}
                          className={`cursor-pointer text-xs border-slate-700 transition-colors ${
                            taskType === "classification" && modelName === m
                              ? "border-cyan-500 bg-cyan-500/10 text-cyan-300"
                              : "text-slate-400 hover:border-slate-500"
                          }`}
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
                <Card className="border-emerald-500/30 bg-emerald-950/10 backdrop-blur">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2 text-emerald-300">
                      <TrendingUp className="h-4 w-4" />
                      Results — {result.model_name ?? modelName}
                    </CardTitle>
                    <Badge className="w-fit bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs">
                      {result.type ?? taskType}
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {result.metrics && Object.entries(result.metrics).map(([k, v]) => (
                      <div key={k} className="flex justify-between items-center py-1.5 border-b border-slate-800/60 last:border-0">
                        <span className="text-xs text-slate-400 font-mono">{k}</span>
                        <span className="text-sm font-semibold text-white tabular-nums">
                          {typeof v === "number" ? v.toFixed(4) : String(v)}
                        </span>
                      </div>
                    ))}
                    {/* Render any extra top-level keys */}
                    {Object.entries(result)
                      .filter(([k]) => !["model_name", "type", "metrics"].includes(k))
                      .map(([k, v]) => (
                        <div key={k} className="py-1.5 border-b border-slate-800/60 last:border-0">
                          <p className="text-xs text-slate-500 font-mono mb-1">{k}</p>
                          <pre className="text-xs text-slate-300 whitespace-pre-wrap break-all">
                            {typeof v === "object" ? JSON.stringify(v, null, 2) : String(v)}
                          </pre>
                        </div>
                      ))}
                  </CardContent>
                </Card>
              )}

              {!result && !training && (
                <Card className="border-slate-800/40 bg-slate-900/30 border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-10 text-center gap-2">
                    <Brain className="h-8 w-8 text-slate-700" />
                    <p className="text-sm text-slate-600">Results will appear here after training</p>
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
