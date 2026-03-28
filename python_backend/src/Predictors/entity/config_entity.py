from dataclasses import dataclass

@dataclass
class JobSimilarityModelConfig:
    model_name: str
    version: str
    local_model_path: str


@dataclass
class JobSimilarityPredictionnConfig:
    pass

    pass



@dataclass
class JobSimilaritynValidationConfig:
    
    pass




@dataclass
class JobSimilaritynTrainingConfig:
    
    pass
