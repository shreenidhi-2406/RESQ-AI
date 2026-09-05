import os
import torch
import torch.nn.functional as F
from transformers import AutoTokenizer, AutoModelForSequenceClassification

# Global variables for pre-loaded models & tokenizers
_informativeness_tokenizer = None
_informativeness_model = None

_humanitarian_tokenizer = None
_humanitarian_model = None

_models_loaded = False


def load_models():
    global _informativeness_tokenizer, _informativeness_model
    global _humanitarian_tokenizer, _humanitarian_model
    global _models_loaded

    if _models_loaded:
        return

    base_dir = os.path.dirname(os.path.abspath(__file__))
    inf_dir = os.path.join(base_dir, 'models', 'informativeness')
    hum_dir = os.path.join(base_dir, 'models', 'humanitarian')

    print("[AI] Loading informativeness model...")
    _informativeness_tokenizer = AutoTokenizer.from_pretrained(inf_dir)
    _informativeness_model = AutoModelForSequenceClassification.from_pretrained(inf_dir)
    _informativeness_model.eval()
    print("[AI] Informativeness model loaded.")

    print("[AI] Loading humanitarian model...")
    _humanitarian_tokenizer = AutoTokenizer.from_pretrained(hum_dir)
    _humanitarian_model = AutoModelForSequenceClassification.from_pretrained(hum_dir)
    _humanitarian_model.eval()
    print("[AI] Humanitarian model loaded.")

    _models_loaded = True
    print("[AI] RESQ-AI AI service ready.")


def is_loaded() -> bool:
    return _models_loaded


def _get_label(config, idx: int) -> str:
    if idx in config.id2label:
        return config.id2label[idx]
    s_idx = str(idx)
    if s_idx in config.id2label:
        return config.id2label[s_idx]
    return f"LABEL_{idx}"


def _format_display_name(category: str) -> str:
    if not category:
        return ""
    # Convert underscore separated label into Title Case
    return " ".join(word.capitalize() for word in category.split("_"))


def predict_informativeness(text: str) -> dict:
    if not _models_loaded:
        raise RuntimeError("Models are not loaded yet.")

    inputs = _informativeness_tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        padding=True,
        max_length=512
    )

    with torch.no_grad():
        outputs = _informativeness_model(**inputs)
        logits = outputs.logits
        probs = F.softmax(logits, dim=-1).squeeze()

    pred_idx = int(torch.argmax(probs, dim=-1))
    confidence = float(probs[pred_idx].item())
    pred_label = _get_label(_informativeness_model.config, pred_idx)

    # Probabilities for not_informative (0) and informative (1)
    prob_0 = float(probs[0].item()) if probs.ndim > 0 else confidence
    prob_1 = float(probs[1].item()) if probs.ndim > 0 and probs.shape[0] > 1 else 0.0

    return {
        "is_informative": pred_label == "informative",
        "label": pred_label,
        "confidence": round(confidence, 4),
        "probabilities": {
            "not_informative": round(prob_0, 4),
            "informative": round(prob_1, 4)
        }
    }


def predict_humanitarian(text: str) -> dict:
    if not _models_loaded:
        raise RuntimeError("Models are not loaded yet.")

    inputs = _humanitarian_tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        padding=True,
        max_length=512
    )

    with torch.no_grad():
        outputs = _humanitarian_model(**inputs)
        logits = outputs.logits
        probs = F.softmax(logits, dim=-1).squeeze()

    num_classes = probs.shape[0]
    k = min(3, num_classes)
    top_vals, top_indices = torch.topk(probs, k=k)

    top_categories = []
    for i in range(k):
        idx = int(top_indices[i].item())
        prob_val = float(top_vals[i].item())
        label_name = _get_label(_humanitarian_model.config, idx)
        top_categories.append({
            "category": label_name,
            "probability": round(prob_val, 4)
        })

    primary_category = top_categories[0]["category"] if top_categories else "not_humanitarian"
    primary_confidence = top_categories[0]["probability"] if top_categories else 0.0

    return {
        "category": primary_category,
        "category_display": _format_display_name(primary_category),
        "confidence": primary_confidence,
        "top_categories": top_categories
    }
