from transformers import AutoTokenizer

tokenizer=AutoTokenizer.from_pretrained("bert-base-uncased")

def tokenize(text):
    return tokenizer(
        text,
        padding="max_length",
        truncation=True,
        max_length=512,
        return_tensors="pt"
    )




def prepare_input(sample):
    resume = sample['resume']
    jd = sample['job_description']

    text = resume + " [SEP] " + jd

    # Handle missing labels for inference
    macro = sample.get("macro_scores", 0)
    micro = sample.get("micro_scores", 0)

    return text, [macro, micro]




import nltk
from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS
import re

STOPWORDS = set(list(ENGLISH_STOP_WORDS)) - {"not", "no", "nor"}

def preprocess_text(text):
    if not isinstance(text, str):
        return ""

    text = re.sub(r'http\S+|www\S+|https\S+', ' ', text)

    text = re.sub(r'\S+@\S+', ' ', text)

    text = re.sub(r'<[^>]+>', ' ', text)

    text = re.sub(r'\s+', ' ', text).strip()

    text = re.sub(r"(\'re)", " are", text)
    text = re.sub(r"(\'s)", " is", text)
    text = re.sub(r"(\'ve)", " have", text)
    text = re.sub(r"(n\'t)", " not", text)
    text = re.sub(r"(\'ll)", " will", text)
    text = re.sub(r"(\'d)", " would", text)
    text = re.sub(r"(\'m)", " am", text)

    text = text.lower()

    text = re.sub(r'[^a-z\s]', ' ', text)

    tokens = [tok for tok in text.split() if len(tok) > 2 and tok not in STOPWORDS]

    return " ".join(tokens)