"""
🚗 Parking Space Detection API with YOLOv8
============================================
Features:
- Image upload endpoint
- Real-time parking detection
- Visual output with bounding boxes
- JSON response with statistics
- Support for single image and batch processing
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from ultralytics import YOLO
import cv2
import numpy as np
from PIL import Image
import io
import os
from datetime import datetime
import base64

# ============================================================
# Initialize Flask App
# ============================================================

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

# ============================================================
# Configuration
# ============================================================

MODEL_PATH = "best.pt"  # Your trained model
UPLOAD_FOLDER = "uploads"
OUTPUT_FOLDER = "outputs"
CONFIDENCE_THRESHOLD = 0.25

# Create folders
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

# ============================================================
# Load YOLOv8 Model
# ============================================================

print("🔄 Loading YOLOv8 model...")
try:
    model = YOLO(MODEL_PATH)
    print(f"✅ Model loaded successfully from {MODEL_PATH}")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    model = None

# ============================================================
# Color Configuration for Visualization
# ============================================================

COLORS = {
    'space-empty': (0, 255, 0),      # Green for empty
    'space-occupied': (0, 0, 255),   # Red for occupied
}

# ============================================================
# Helper Functions
# ============================================================

def draw_detections(image, results, conf_threshold=0.25):
    """
    Draw bounding boxes and labels on image
    """
    img_draw = image.copy()
    
    for result in results:
        boxes = result.boxes
        
        for box in boxes:
            # Get box coordinates
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            
            # Get confidence and class
            conf = float(box.conf[0])
            cls = int(box.cls[0])
            class_name = result.names[cls]
            
            # Skip low confidence detections
            if conf < conf_threshold:
                continue
            
            # Get color based on class
            color = COLORS.get(class_name, (255, 255, 0))
            
            # Draw bounding box
            cv2.rectangle(img_draw, (x1, y1), (x2, y2), color, 2)
            
            # Prepare label
            label = f"{class_name.replace('space-', '')}: {conf:.2f}"
            
            # Get text size for background
            (text_width, text_height), baseline = cv2.getTextSize(
                label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1
            )
            
            # Draw label background
            cv2.rectangle(
                img_draw,
                (x1, y1 - text_height - 10),
                (x1 + text_width, y1),
                color,
                -1
            )
            
            # Draw label text
            cv2.putText(
                img_draw,
                label,
                (x1, y1 - 5),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                (255, 255, 255),
                1,
                cv2.LINE_AA
            )
    
    return img_draw

def get_detection_stats(results, conf_threshold=0.25):
    """
    Extract detection statistics
    """
    stats = {
        'total_spaces': 0,
        'empty_spaces': 0,
        'occupied_spaces': 0,
        'occupancy_rate': 0.0,
        'detections': []
    }
    
    for result in results:
        boxes = result.boxes
        
        for box in boxes:
            conf = float(box.conf[0])
            
            if conf < conf_threshold:
                continue
            
            cls = int(box.cls[0])
            class_name = result.names[cls]
            x1, y1, x2, y2 = map(float, box.xyxy[0])
            
            stats['total_spaces'] += 1
            
            if class_name == 'space-empty':
                stats['empty_spaces'] += 1
            elif class_name == 'space-occupied':
                stats['occupied_spaces'] += 1
            
            # Add detection details
            stats['detections'].append({
                'class': class_name,
                'confidence': round(conf, 4),
                'bbox': {
                    'x1': round(x1, 2),
                    'y1': round(y1, 2),
                    'x2': round(x2, 2),
                    'y2': round(y2, 2)
                }
            })
    
    # Calculate occupancy rate
    if stats['total_spaces'] > 0:
        stats['occupancy_rate'] = round(
            (stats['occupied_spaces'] / stats['total_spaces']) * 100, 2
        )
    
    return stats

def extract_spot_details(results, conf_threshold=0.25):
    """
    Build per-spot occupancy booleans and confidence scores for frontend
    """
    per_spot = []
    confidences = []

    for result in results:
        boxes = result.boxes

        for box in boxes:
            conf = float(box.conf[0])

            if conf < conf_threshold:
                continue

            cls = int(box.cls[0])
            class_name = result.names[cls]

            per_spot.append(class_name == 'space-occupied')
            confidences.append(round(conf, 4))

    return per_spot, confidences

def image_to_base64(image):
    """
    Convert OpenCV image to base64 string
    """
    _, buffer = cv2.imencode('.jpg', image)
    img_base64 = base64.b64encode(buffer).decode('utf-8')
    return img_base64


def run_detection_pipeline(file_storage, conf_threshold):
    """
    Parse inbound image, run YOLO inference, save artifacts, and
    return (stats, annotated_image, metadata dict)
    """
    img_bytes = file_storage.read()
    nparr = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:
        raise ValueError('Invalid image file')

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    original_filename = f"original_{timestamp}.jpg"
    annotated_filename = f"detected_{timestamp}.jpg"

    original_path = os.path.join(UPLOAD_FOLDER, original_filename)
    annotated_path = os.path.join(OUTPUT_FOLDER, annotated_filename)

    cv2.imwrite(original_path, img)

    results = model(img, conf=conf_threshold, verbose=False)
    stats = get_detection_stats(results, conf_threshold)
    img_annotated = draw_detections(img, results, conf_threshold)

    cv2.imwrite(annotated_path, img_annotated)

    metadata = {
        'timestamp': timestamp,
        'original_filename': original_filename,
        'annotated_filename': annotated_filename
    }

    return stats, img_annotated, metadata


def build_frontend_payload(stats, img_annotated, include_image=True):
    """
    Format detection output so it matches the frontend contract.
    """
    per_spot = [
        detection['class'] == 'space-occupied'
        for detection in stats.get('detections', [])
    ]
    confidence_values = [
        detection['confidence']
        for detection in stats.get('detections', [])
    ]

    payload = {
        'success': True,
        'timestamp': datetime.now().isoformat(),
        'annotated_image_b64': image_to_base64(img_annotated) if include_image else None,
        'occupied_count': stats['occupied_spaces'],
        'free_count': stats['empty_spaces'],
        'per_spot': per_spot,
        'confidence': confidence_values,
        'total_count': stats['total_spaces']
    }
    return payload

# ============================================================
# API Routes
# ============================================================

@app.route('/', methods=['GET'])
def home():
    """
    API home page with documentation
    """
    return jsonify({
        'message': 'Parking Space Detection API',
        'version': '1.0.0',
        'model': 'YOLOv8m (Fine-tuned on PKLot)',
        'performance': {
            'mAP50': 0.9930,
            'mAP50-95': 0.9891,
            'Precision': 0.9987,
            'Recall': 0.9914,
            'F1-Score': 0.9950
        },
        'endpoints': {
            '/': 'API documentation',
            '/health': 'Health check',
            '/detect': 'POST - Detect parking spaces (returns JSON + image)',
            '/detect/json': 'POST - Detect parking spaces (JSON only)',
            '/detect/image': 'POST - Detect parking spaces (image only)',
            '/infer': 'POST - Frontend-aligned JSON response'
        },
        'usage': {
            'method': 'POST',
            'content_type': 'multipart/form-data',
            'parameters': {
                'image': 'Image file (required)',
                'confidence': 'Confidence threshold (optional, default: 0.25)',
                'return_image': 'Return annotated image (optional, default: true)'
            }
        }
    })

@app.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint
    """
    model_status = "loaded" if model is not None else "not loaded"
    
    return jsonify({
        'status': 'healthy' if model is not None else 'unhealthy',
        'model': model_status,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/detect', methods=['POST'])
def detect_parking():
    """
    Main detection endpoint - returns both JSON and annotated image
    """
    if model is None:
        return jsonify({'error': 'Model not loaded'}), 500
    
    # Check if image file is present
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400
    
    file = request.files['image']
    
    if file.filename == '':
        return jsonify({'error': 'Empty filename'}), 400
    
    # Get confidence threshold from request
    conf_threshold = float(request.form.get('confidence', CONFIDENCE_THRESHOLD))
    return_image = request.form.get('return_image', 'true').lower() == 'true'
    
    try:
        stats, img_annotated, metadata = run_detection_pipeline(file, conf_threshold)
        frontend_payload = build_frontend_payload(stats, img_annotated, include_image=return_image)
        
        response_data = {
            'success': True,
            'timestamp': metadata['timestamp'],
            'annotated_image_b64': frontend_payload['annotated_image_b64'],
            'occupied_count': frontend_payload['occupied_count'],
            'free_count': frontend_payload['free_count'],
            'per_spot': frontend_payload['per_spot'],
            'confidence': frontend_payload['confidence'],
            'statistics': stats,
            'model_info': {
                'confidence_threshold': conf_threshold,
                'model': 'YOLOv8m'
            },
            'files': {
                'original': metadata['original_filename'],
                'annotated': metadata['annotated_filename']
            }
        }
        
        return jsonify(response_data)
    
    except ValueError as ve:
        return jsonify({'error': str(ve)}), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/infer', methods=['POST'])
def infer_endpoint():
    """
    Frontend-aligned endpoint that returns simplified JSON payload
    """
    if model is None:
        return jsonify({'error': 'Model not loaded'}), 500

    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400

    file = request.files['image']

    if file.filename == '':
        return jsonify({'error': 'Empty filename'}), 400

    conf_threshold = float(request.form.get('confidence', CONFIDENCE_THRESHOLD))

    try:
        img_bytes = file.read()
        nparr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            return jsonify({'error': 'Invalid image file'}), 400

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        original_filename = f"original_{timestamp}.jpg"
        original_path = os.path.join(UPLOAD_FOLDER, original_filename)
        cv2.imwrite(original_path, img)

        results = model(img, conf=conf_threshold, verbose=False)

        stats = get_detection_stats(results, conf_threshold)
        per_spot, confidences = extract_spot_details(results, conf_threshold)

        img_annotated = draw_detections(img, results, conf_threshold)
        annotated_filename = f"detected_{timestamp}.jpg"
        annotated_path = os.path.join(OUTPUT_FOLDER, annotated_filename)
        cv2.imwrite(annotated_path, img_annotated)

        response_data = {
            'success': True,
            'timestamp': datetime.now().isoformat(),
            'annotated_image_b64': image_to_base64(img_annotated),
            'occupied_count': stats['occupied_spaces'],
            'free_count': stats['empty_spaces'],
            'per_spot': per_spot,
            'confidence': confidences,
            'files': {
                'original': original_filename,
                'annotated': annotated_filename
            }
        }

        return jsonify(response_data)

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/detect/json', methods=['POST'])
def detect_json_only():
    """
    Detection endpoint - returns only JSON (no image)
    """
    if model is None:
        return jsonify({'error': 'Model not loaded'}), 500
    
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400
    
    file = request.files['image']
    conf_threshold = float(request.form.get('confidence', CONFIDENCE_THRESHOLD))
    
    try:
        # Read and process image
        img_bytes = file.read()
        nparr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Run detection
        results = model(img, conf=conf_threshold, verbose=False)
        
        # Get statistics
        stats = get_detection_stats(results, conf_threshold)
        
        return jsonify({
            'success': True,
            'statistics': stats,
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/detect/image', methods=['POST'])
def detect_image_only():
    """
    Detection endpoint - returns only annotated image
    """
    if model is None:
        return jsonify({'error': 'Model not loaded'}), 500
    
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400
    
    file = request.files['image']
    conf_threshold = float(request.form.get('confidence', CONFIDENCE_THRESHOLD))
    
    try:
        # Read and process image
        img_bytes = file.read()
        nparr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Run detection
        results = model(img, conf=conf_threshold, verbose=False)
        
        # Draw detections
        img_annotated = draw_detections(img, results, conf_threshold)
        
        # Convert to bytes
        _, buffer = cv2.imencode('.jpg', img_annotated)
        img_io = io.BytesIO(buffer)
        img_io.seek(0)
        
        return send_file(img_io, mimetype='image/jpeg')
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/infer', methods=['POST'])
def infer_frontend():
    """
    Frontend-oriented endpoint that always returns the contract expected by the UI.
    """
    if model is None:
        return jsonify({'error': 'Model not loaded'}), 500

    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'Empty filename'}), 400

    conf_threshold = float(request.form.get('confidence', CONFIDENCE_THRESHOLD))

    try:
        stats, img_annotated, metadata = run_detection_pipeline(file, conf_threshold)
        payload = build_frontend_payload(stats, img_annotated, include_image=True)
        payload['model_info'] = {
            'confidence_threshold': conf_threshold,
            'model': 'YOLOv8m'
        }
        payload['files'] = {
            'original': metadata['original_filename'],
            'annotated': metadata['annotated_filename']
        }

        return jsonify(payload)

    except ValueError as ve:
        return jsonify({'error': str(ve)}), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/download/<filename>', methods=['GET'])
def download_file(filename):
    """
    Download saved files
    """
    # Check in outputs folder
    file_path = os.path.join(OUTPUT_FOLDER, filename)
    if os.path.exists(file_path):
        return send_file(file_path, mimetype='image/jpeg')
    
    # Check in uploads folder
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    if os.path.exists(file_path):
        return send_file(file_path, mimetype='image/jpeg')
    
    return jsonify({'error': 'File not found'}), 404

# ============================================================
# Run Server
# ============================================================

if __name__ == '__main__':
    print("\n" + "=" * 70)
    print("🚗 Parking Space Detection API")
    print("=" * 70)
    print(f"✅ Model: {MODEL_PATH}")
    print(f"✅ Confidence Threshold: {CONFIDENCE_THRESHOLD}")
    print(f"✅ Upload Folder: {UPLOAD_FOLDER}")
    print(f"✅ Output Folder: {OUTPUT_FOLDER}")
    print("=" * 70)
    print("\n🌐 Starting Flask server...")
    print("📡 API will be available at: http://localhost:5000")
    print("📚 Documentation: http://localhost:5000/")
    print("\nPress CTRL+C to stop the server")
    print("=" * 70 + "\n")
    
    # Run Flask app
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True,
        threaded=True
    )