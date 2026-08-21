from contextlib import asynccontextmanager
from typing import Optional
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import uvicorn

from inference import load_models, is_loaded, predict_informativeness, predict_humanitarian


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Load pre-trained models once into memory
    load_models()
    yield
    # Shutdown logic if needed in future
    print("[AI] RESQ-AI AI Service shut down.")


app = FastAPI(
    title="RESQ-AI Emergency Intelligence API",
    description="FastAPI microservice for disaster text informativeness and humanitarian classification.",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS for local development (Node.js backend on 3001, Vite UI on 5173)
allowed_origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5173",
    "http://127.0.0.1:3001",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    text: str = Field(..., description="The disaster or emergency text snippet to analyze.")
    incident_id: Optional[str] = Field(None, description="Optional incident ID for correlation.")


@app.get("/")
async def root():
    return {
        "service": "RESQ-AI AI Service",
        "status": "running"
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "models_loaded": is_loaded()
    }


@app.post("/api/ai/analyze")
async def analyze_text(request: AnalyzeRequest):
    raw_text = request.text.strip() if request.text else ""
    if not raw_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The 'text' field cannot be empty or whitespace only."
        )

    try:
        # Step 1: Predict Informativeness
        inf_result = predict_informativeness(raw_text)

        # Step 2: Conditional Optimization
        # Only run humanitarian classification if the text is deemed INFORMATIVE
        humanitarian_result = None
        if inf_result.get("is_informative", False):
            humanitarian_result = predict_humanitarian(raw_text)

        return {
            "incident_id": request.incident_id,
            "text": request.text,
            "informativeness": {
                "is_informative": inf_result["is_informative"],
                "label": inf_result["label"],
                "confidence": inf_result["confidence"]
            },
            "humanitarian": humanitarian_result
        }
    except Exception as err:
        print(f"[AI Error] Error during inference execution: {str(err)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal error occurred while processing the text snippet."
        )


if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=False)
