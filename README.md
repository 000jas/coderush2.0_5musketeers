# coderush2.0-5musketeers

# SDG-03 — Space Mission Operations Automator

This project is a simulation-first mission operations platform designed to support space mission teams with planning, telemetry monitoring, anomaly detection, and operational decision support. The goal is to provide a practical interface for managing mission activities while keeping critical or irreversible actions behind explicit authority and verification.

## What the project does

The system combines a modern web dashboard with a 3D mission visualization experience to help operators:

- review mission status and telemetry in a single interface
- inspect satellite health signals and subsystem conditions
- detect anomalies and surface suggested procedures
- explore mission timelines, events, and operational workflows
- visualize orbital and spacecraft behavior in an interactive 3D environment

The project is organized as a multi-part prototype with:

- a main mission dashboard built with Next.js
- a Python-based machine learning workflow for training anomaly/operation models
- a separate 3D visualization demo for satellite simulation

## Core features

- Mission dashboard with command center, telemetry, and event views
- Interactive 3D digital twin of a satellite mission environment
- Timeline and procedure planning views
- Anomaly-informed recommendations powered by trained ML models
- Responsive UI built with modern React components and Tailwind CSS

## Tech stack

### Frontend
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui component system
- React Three Fiber + Three.js for 3D visualization
- Lucide icons and Vercel Analytics

### Backend / ML
- Python 3
- pandas
- scikit-learn
- joblib
- machine learning pipeline for multi-output classification

### Additional demo app
- Vite + React + TypeScript for the satellite visualization prototype in the Animation folder

## Project structure

- frontend/ — main mission operations web app
- backend/ — training scripts, dataset, and model artifacts
- Animation/satellite-visualization/ — standalone 3D visualization demo

## Prerequisites

Before running the project, make sure you have:

- Node.js 18+ and npm or pnpm
- Python 3.10+
- pip

## How to run the project

### 1. Start the main frontend

From the project root:

```bash
cd frontend
pnpm install
pnpm dev
```

Then open the local URL shown by Next.js in your browser.

### 2. Train the backend model (optional)

The backend already includes trained model files, but you can retrain them if needed:

```bash
cd backend
pip install pandas scikit-learn joblib
python train.py
```

This will read the dataset and generate:

- satellite_model.joblib
- telemetry_encoders.joblib

### 3. Run the standalone 3D visualization demo (optional)

```bash
cd Animation/satellite-visualization
npm install
npm run dev
```

## Notes

This repository is a prototype focused on demonstrating how mission operations could be supported through a combined UI, simulation layer, and predictive workflow. It is intended for exploration and presentation rather than full production deployment.

Developed by Team 5 Musketeers.
