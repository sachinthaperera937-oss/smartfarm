# SmartFarm

SmartFarm is a responsive farm-intelligence platform with field monitoring, weather forecasting, operational task tracking, and explainable AI-style agronomy insights.

## Included capabilities

- Live weather and five-day forecasts via Open-Meteo (no weather API key required)
- AI field intelligence endpoint that combines crop, soil moisture, humidity, and forecast data into actionable recommendations
- Responsive professional dashboard, field monitor, task workflow, reports, and settings
- Local task persistence for the dashboard demo; existing MongoDB data routes remain available for multi-user deployments
- Health endpoint at `/api/health`

## Run locally

```powershell
cd backend
Copy-Item .env.example .env
npm install
npm start
```

Open [http://localhost:5000](http://localhost:5000). The backend serves the frontend directly, so only one service needs to be deployed.

## Deploy

Deploy the `backend` directory as a Node web service. Use `npm start` as the start command and set the following environment variables in the provider dashboard:

| Variable | Required | Purpose |
| --- | --- | --- |
| `PORT` | Provider supplied | Listening port |
| `MONGO_URI` | Optional for demo, required for accounts/data | MongoDB connection |
| `JWT_SECRET` | Required with authentication | Long random application secret |
| `CLIENT_ORIGIN` | Optional | Comma-separated allowed origins for separated frontend deployments |
| `GEMINI_API_KEY` | Optional | Enables the legacy generative recommendation service |

Never commit `.env` files. Rotate any credentials that were previously committed or shared.

## API quick reference

- `GET /api/health` — service status
- `GET /api/weather?latitude=6.9271&longitude=79.8612&location=Colombo` — current conditions and five-day forecast
- `POST /api/insights/generate` — explainable field recommendations; accepts `latitude`, `longitude`, `crop`, `soilMoisture`, and `humidity`
