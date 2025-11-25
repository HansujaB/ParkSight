### ParkSight – Intelligent Parking Visibility Suite
ParkSight pairs a YOLOv8-powered Flask API with a modern Next.js dashboard to deliver near-real-time visibility into parking lot utilization. Upload a still image from any camera feed, visualize detections with bounding boxes, monitor occupancy counters, and analyze historical trends without leaving the browser.

---

### Key Features
- Live annotated feed: Uploads pass through YOLOv8, returning base64 imagery with colored overlays for free vs occupied slots (`src/components/LiveView.tsx`).
- Smart occupancy analytics: Aggregate counters, utilization KPIs, and interactive slot grid update immediately after each inference (`src/components/Counters.tsx`, `src/components/SpotTable.tsx`).
- Session history & trends: Each inference is logged locally to render time-series charts and quick stats (`src/components/TrendChart.tsx`).
- Camera & API management: Add or remove cameras, switch endpoints, adjust timeouts, and tune UI preferences from the settings workspace (`src/app/settings/page.tsx`).
- Operational awareness: Connection health, round-trip latency, and error surfacing keep operators informed (`src/components/StatusBar.tsx`).

---

### Methodology
1. **Image acquisition** – Users drag-drop or browse to upload a parking-lot frame. Client-side validation ensures the file is an image under 10 MB before invoking the pipeline (`src/components/FileUpload.tsx`).
2. **Context-aware request** – The UI attaches the active camera ID and sends the payload to the configured backend `/detect` endpoint with a configurable timeout (`src/contexts/ParkingContext.tsx`).
3. **YOLOv8 inference** – The Flask service loads the fine-tuned `best.pt` model and runs detection via Ultralytics, filtering predictions by the requested confidence threshold, then annotates the frame using OpenCV (`backend/app.py`).
4. **Post-processing** – Detection stats (occupied, empty, per-spot states, confidences) are computed, images are persisted under `uploads/` & `outputs/`, and a base64-encoded preview plus metadata are returned in JSON.
5. **Stateful visualization** – The frontend context stores the fresh payload, appends a session-history entry capped at the latest 100 records, and re-renders the dashboard panels. Trend views and interactive grids hydrate in-place without a reload.
6. **Operator feedback loop** – Status cards expose latency, connection health, and failures. Users can tweak thresholds, endpoints, or theme presets while remaining on the dashboard.

---

### Tech Stack
- **Frontend**
  - Next.js 14 (App Router) + React 18 (`package.json`)
  - Tailwind CSS 3 & PostCSS for expressive theming (`tailwind.config.js`, `src/app/globals.css`)
  - Chart.js 4 with `react-chartjs-2` adapters for occupancy trends
  - Lucide icons, clsx utilities, and `react-hot-toast` for UX polish
- **Backend**
  - Python 3.10+, Flask 3 with Flask-CORS for API serving (`backend/app.py`)
  - Ultralytics YOLOv8, PyTorch 2.3, TorchVision 0.18 for model inference (`backend/requirements.txt`)
  - OpenCV, Pillow, NumPy for image handling and annotation overlays
- **Infrastructure & Tooling**
  - Local virtual environment under `backend/venv/`
  - NPM scripts for Next.js dev/build/start lifecycle
  - Client-side persistence via `localStorage` for settings and camera definitions

---

### Project Structure
```
ParkSight/
├── backend/
│   ├── app.py                # Flask + YOLOv8 API
│   ├── requirements.txt
│   ├── best.pt               # Fine-tuned model weights (placeholder)
│   ├── uploads/              # Raw submissions (gitignored)
│   └── outputs/              # Annotated frames (gitignored)
├── src/
│   ├── app/
│   │   ├── page.tsx          # Main dashboard shell
│   │   └── settings/page.tsx # Camera/API management UI
│   ├── components/           # Dashboard widgets & layout
│   └── contexts/ParkingContext.tsx
├── package.json              # Next.js workspace manifest
└── README.md (you are here)
```

---

### Getting Started

#### Prerequisites
- Node.js ≥ 18
- Python ≥ 3.10 (virtual environment strongly recommended)
- GPU support optional but recommended for YOLOv8 throughput

#### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows PowerShell
pip install -r requirements.txt
python app.py                  # Starts Flask on http://0.0.0.0:5000
```
Optional environment tweaks:
- Update `MODEL_PATH`, `UPLOAD_FOLDER`, `OUTPUT_FOLDER`, or `CONFIDENCE_THRESHOLD` near the top of `backend/app.py`.
- Preload your fine-tuned weights as `best.pt` or change the constant.

#### Frontend Setup
```bash
cd ParkSight
npm install
npm run dev                    # Serves Next.js on http://localhost:3000
```
The dashboard expects the API at `http://localhost:5000/detect` by default. Adjust this under Settings → API Configuration or via `localStorage` (key `parkingSettings`).

---

### Running the System
1. Boot the Flask detector (`python backend/app.py`).
2. Start the Next.js client (`npm run dev`).
3. Visit `http://localhost:3000`, open the sidebar, select a camera (or add one in settings), and upload a test frame.
4. Monitor the live view, counters, spot grid, and session analytics as new images are processed.

---

### API Overview
| Endpoint          | Method | Description |
|-------------------|--------|-------------|
| `/`               | GET    | API metadata & instructions |
| `/health`         | GET    | Health + model status |
| `/detect`         | POST   | Multipart upload → JSON payload + optional annotated image (default) |
| `/detect/json`    | POST   | JSON-only response |
| `/detect/image`   | POST   | Annotated image only |
| `/infer`          | POST   | Frontend-aligned payload identical to `/detect` without extra stats |
| `/download/<fn>`  | GET    | Fetch stored original or annotated images |

All POST routes accept `image` (required), optional `confidence` (float), and in `/detect` an optional `return_image` flag.

---

### Configuration & Customization
- **Camera catalog**: Manage IDs/names in the Settings page; selections persist locally.
- **Theme & Display**: Toggle light/dark/system theming plus UI toggles for confidence chips and trend modules (`SettingsPanel` + `ThemeProvider`).
- **Timeouts**: Tune fetch aborts from 5–60 seconds depending on inference latency.
- **Session management**: Clear history from the sidebar when you want a fresh analytics slate.

---

### Troubleshooting
- **Model failed to load**: Ensure `best.pt` exists and matches the Ultralytics version pinned in `requirements.txt`.
- **CORS/Network errors**: Confirm Flask is running on the same host/port as configured in the client, or update the API endpoint in settings.
- **Blank live view**: The backend only returns `annotated_image_b64` when `return_image=true`; keep the default or re-send with that flag.
