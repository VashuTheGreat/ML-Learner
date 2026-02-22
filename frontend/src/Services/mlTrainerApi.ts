import axios from 'axios';

const pythonApiInstance = axios.create({
    baseURL: 'http://localhost:8000',
    headers: { 'Content-Type': 'application/json' },
});

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ModelParamMeta {
    type: 'int' | 'float' | 'bool' | string;
    default: number | boolean | null;
    description: string;
}

export interface AvailableAttributes {
    make_regression_params: Record<string, ModelParamMeta>;
    make_classification_params: Record<string, ModelParamMeta>;
    regression_models: string[];
    classification_models: string[];
    model_train_config: Record<string, any>;
}

export interface TrainPayload {
    model_name: string;
    model_params: Record<string, any>;
    type: 'regression' | 'classification';
    make_dataset: Record<string, any>;
}

export interface TrainResult {
    model_name: string;
    type: string;
    metrics: Record<string, number>;
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
