#!/bin/bash
export GEMINI_API_KEY="${GEMINI_API_KEY:-AIzaSyCyGSlZvWMS0TPzrUMRIoCl79YINbTIGM8}"
uvicorn main:app --reload --host 0.0.0.0 --port 8000
