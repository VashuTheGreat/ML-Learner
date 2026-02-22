import { useState, useEffect } from "react";
import mlTrainerApi, {
  AvailableAttributes,
  TrainPayload,
  TrainResult,
} from "@/Services/mlTrainerApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { 
  Brain, 
  ChevronRight, 
  Loader2, 
  AlertCircle, 
  TrendingUp, 
  BarChart3, 
  Cpu, 
  FlaskConical,
  Dna,
  Zap,
  Layers,
  Sparkles
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";

// --- Local type alias ---
type ParamMeta = {
  type: string;
  default: number | boolean | string | null;
  description: string;
};

// --- Helpers ---
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

export default function Playground() {
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

  return (
    <div className="min-h-screen bg-transparent text-white">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative pt-24 pb-12 px-6">
        <div className="absolute inset-0 top-0 h-[500px] bg-gradient-to-b from-primary/10 via-background to-background -z-10" />
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4 animate-fade-in">
              <Badge variant="outline" className="px-3 py-1 border-primary/30 text-primary bg-primary/5 backdrop-blur-sm animate-pulse">
                <Sparkles className="w-3 h-3 mr-2" />
                AI Lab Environment
              </Badge>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                ML <span className="gradient-text">Playground</span>
              </h1>
              <p className="text-slate-400 max-w-2xl text-lg">
                Experiment with machine learning models in real-time. Tune hyperparameters, 
                generate synthetic data, and visualize the performance of your algorithms.
              </p>
            </div>
            
            <div className="flex items-center gap-4 bg-slate-900/50 p-2 rounded-2xl border border-slate-800/50 backdrop-blur shadow-2xl">
              <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-800/80">
                <Cpu className="w-5 h-5 text-cyan-400" />
                <div className="text-left">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Engine</p>
                  <p className="text-sm font-semibold text-slate-200">Python 3.x</p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-800/80">
                <Zap className="w-5 h-5 text-amber-400" />
                <div className="text-left">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Status</p>
                  <p className="text-sm font-semibold text-emerald-400">Connected</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 pb-20">
        {loadingAttrs && (
          <div className="flex flex-col items-center justify-center py-32 space-y-4 animate-pulse">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
              <Dna className="h-16 w-16 text-primary relative animate-spin-slow" />
            </div>
            <p className="text-slate-400 font-medium">Initializing Neural Pathways...</p>
          </div>
        )}

        {attrsError && (
          <Card className="border-red-500/30 bg-red-950/20 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                <AlertCircle className="h-6 w-6 text-red-400" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-red-300">Backend Connection Error</p>
                <p className="text-sm text-slate-400 mt-1">{attrsError}</p>
                <div className="mt-3 flex items-center gap-2 text-[10px] font-mono p-2 bg-black/40 rounded border border-white/5">
                  <span className="text-slate-500">$</span>
                  <span className="text-cyan-400">uvicorn src.app:app --reload --port 8000</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {attrs && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* --- Configuration Sidebar --- */}
            <div className="lg:col-span-4 space-y-6">
              <div className="sticky top-24 space-y-6">
                {/* Mode Selector */}
                <Card className="border-slate-800/60 bg-slate-900/60 backdrop-blur shadow-xl overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                  <CardHeader className="pb-4">
                    <CardTitle className="text-sm uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-primary" />
                      Learning Mode
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex gap-2">
                    {(["regression", "classification"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTaskType(t)}
                        className={`flex-1 rounded-xl border py-4 px-2 text-xs font-bold uppercase tracking-tight transition-all duration-300 ${
                          taskType === t
                            ? "border-primary bg-primary/10 text-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]"
                            : "border-slate-800 bg-slate-800/30 text-slate-500 hover:border-slate-700 hover:text-slate-400"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </CardContent>
                </Card>

                {/* Model Configuration */}
                <Card className="border-slate-800/60 bg-slate-900/60 backdrop-blur shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-sm uppercase tracking-widest text-slate-400">Model Configuration</CardTitle>
                    <CardDescription className="text-xs">Select your architecture and tune weights</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Algorithm</Label>
                      <Select value={modelName} onValueChange={setModelName}>
                        <SelectTrigger className="bg-slate-950/50 border-slate-800 text-slate-200 rounded-xl h-11 focus:ring-primary/20">
                          <SelectValue placeholder="Choose a model…" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                          {(taskType === "regression"
                            ? attrs.regression_models
                            : attrs.classification_models
                          ).map((m) => (
                            <SelectItem key={m} value={m} className="focus:bg-primary/10 py-3">
                              {m}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {Object.keys(modelParamsMeta).length > 0 && (
                      <div className="space-y-4 pt-4 border-t border-slate-800/50">
                        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Hyperparameters</p>
                        <div className="grid grid-cols-1 gap-4">
                          {Object.entries(modelParamsMeta).map(([key, meta]) => (
                            <div key={key} className="space-y-2">
                              <div className="flex justify-between items-center">
                                <Label className="text-xs text-slate-300 font-medium">{key}</Label>
                                <Badge variant="secondary" className="text-[9px] font-mono bg-slate-800 text-slate-400">
                                  {meta?.type}
                                </Badge>
                              </div>
                              {meta?.type === "bool" ? (
                                <Select
                                  value={modelParams[key] ?? defaultStr(meta?.default)}
                                  onValueChange={(v) => setModelParams((p) => ({ ...p, [key]: v }))}
                                >
                                  <SelectTrigger className="bg-slate-950/50 border-slate-800 text-slate-200 h-10 text-xs rounded-xl">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-slate-900 border-slate-800">
                                    <SelectItem value="true">true</SelectItem>
                                    <SelectItem value="false">false</SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Input
                                  className="bg-slate-950/50 border-slate-800 text-slate-200 h-10 text-xs rounded-xl focus:ring-primary/20"
                                  placeholder={defaultStr(meta?.default) || "default"}
                                  value={modelParams[key] ?? defaultStr(meta?.default)}
                                  onChange={(e) => setModelParams((p) => ({ ...p, [key]: e.target.value }))}
                                />
                              )}
                            </div>
                          ))}
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
                  className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-14 rounded-2xl transition-all duration-300 shadow-[0_10px_30px_rgba(var(--primary-rgb),0.3)] hover:shadow-primary/40 disabled:opacity-50 group"
                >
                  {training ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Synthesizing Model...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-5 w-5 fill-current transition-transform group-hover:scale-125" />
                      Train in Playground
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* --- Results Main Area --- */}
            <div className="lg:col-span-8 space-y-8">
              {/* Dataset Params Card */}
              <Card className="border-slate-800/60 bg-slate-900/60 backdrop-blur shadow-xl">
                <CardHeader>
                  <CardTitle className="text-sm uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-cyan-400" />
                    Data Generator
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(datasetParamsMeta as Record<string, ParamMeta>).map(([key, meta]) => (
                      <div key={key} className="space-y-2">
                        <Label className="text-[10px] text-slate-500 font-bold uppercase truncate" title={meta.description}>{key}</Label>
                        <Input
                          className="bg-slate-950/20 border-slate-800 text-slate-200 h-9 text-xs rounded-lg text-center"
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
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex gap-3 items-start animate-in zoom-in-95">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-300 font-medium">{trainError}</p>
                </div>
              )}

              {/* Results visualization */}
              {result ? (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
                  {/* Performance Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {result.metrics && Object.entries(result.metrics).map(([k, v]) => (
                      <Card key={k} className="bg-slate-900/40 border-slate-800 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-primary/10 rounded-full blur-2xl -mr-8 -mt-8" />
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-[10px] uppercase font-bold text-slate-500">{k.replace(/_/g, ' ')}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <p className="text-2xl font-black text-white">
                            {typeof v === "number" ? v.toFixed(3) : String(v)}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Visualizations (Plots) */}
                  {result.plots && result.plots.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {result.plots.map((plot, idx) => (
                        <Card key={idx} className="border-slate-800 bg-slate-900/60 overflow-hidden group shadow-2xl">
                          <CardHeader className="bg-slate-900/80 border-b border-slate-800 p-4">
                            <CardTitle className="text-xs font-bold uppercase text-slate-400">Visualization Node #{idx + 1}</CardTitle>
                          </CardHeader>
                          <div className="aspect-square relative flex items-center justify-center p-4 bg-white/5 group-hover:bg-white/10 transition-colors duration-500">
                            <img 
                              src={`data:image/png;base64,${plot}`} 
                              alt={`ML Result Visualization ${idx}`}
                              className="max-w-full max-h-full rounded shadow-xl"
                            />
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Empty state */
                <div className="h-[500px] border-2 border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center space-y-6 text-slate-600">
                  <div className="h-24 w-24 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center animate-pulse">
                    <FlaskConical className="h-10 w-10 text-slate-700" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-lg font-bold text-slate-400">Playground Ready</h3>
                    <p className="max-w-xs text-sm">Configure your parameters and click "Train" to see intelligence in action.</p>
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
