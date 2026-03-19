import axios from 'axios';

const pythonApiInstance = axios.create({
    baseURL: 'http://localhost:8000',
    headers: { 'Content-Type': 'application/json' },
});

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DatasetParamMeta {
    type: 'int' | 'float' | 'bool' | string;
    default: number | boolean | null;
    description: string;
}

export interface ModelConfig {
    class: string;
    /** default_params is a flat key→value record (no type metadata) */
    default_params: Record<string, string | number | boolean | null> | null;
}

export interface AvailableAttributes {
    make_regression_params: Record<string, DatasetParamMeta>;
    make_classification_params: Record<string, DatasetParamMeta>;
    regression_models: string[];
    classification_models: string[];
    model_train_config: {
        regression_models: Record<string, ModelConfig>;
        classification_models: Record<string, ModelConfig>;
    };
}

export interface TrainPayload {
    model_name: string;
    model_params: Record<string, any>;
    type: 'regression' | 'classification';
    make_dataset: Record<string, any>;
}

/** Regression metrics from the backend */
export interface RegressionMetrics {
    mae: number;
    mse: number;
    rmse: number;
    r2: number;
}

/** Classification metrics from the backend */
export interface ClassificationMetrics {
    accuracy: number;
    precision: number;
    recall: number;
    f1: number;
}

export interface TrainResult {
    model_name?: string;
    type?: string;
    /** Regression: mae/mse/rmse/r2. Classification: accuracy/precision/recall/f1 */
    mae?: number;
    mse?: number;
    rmse?: number;
    r2?: number;
    accuracy?: number;
    precision?: number;
    recall?: number;
    f1?: number;
    plots: string[];
    [key: string]: any;
}

// ─── Service ──────────────────────────────────────────────────────────────────

class MLTrainerApi {
    /** Fetch all available models and their configurable parameters */
    async getAvailableAttributes(): Promise<AvailableAttributes> {
        const response = await pythonApiInstance.get('/api/train/get_available_attributes');
        return response.data;
    }

    /** Train a regression or classification model with custom config */
    async trainModel(payload: TrainPayload): Promise<TrainResult> {
        const response = await pythonApiInstance.post('/api/train/train', payload);
        return response.data;
    }
}

export default new MLTrainerApi();
