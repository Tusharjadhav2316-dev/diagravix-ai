#!/bin/bash
export GEMINI_API_KEY="${GEMINI_API_KEY:-your_gemini_api_key_here}"
uvicorn main:app --reload --host 0.0.0.0 --port 8000
