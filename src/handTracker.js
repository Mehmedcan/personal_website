import { Hands } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import { WEBCAM_PREVIEW_OPACITY } from './config/constants.js';

// Finger landmark indices
const FINGER_INDICES = {
  THUMB_TIP: 4,
  INDEX_TIP: 8,
  MIDDLE_TIP: 12
};

const PINCH_THRESHOLD = 0.045;
const CAMERA_DIMENSIONS = { width: 640, height: 480 };

/**
 * HandTracker
 * Handles webcam-based hand tracking using MediaPipe
 */
export class HandTracker {
  constructor(onHandMove) {
    this.onHandMove = onHandMove;
    this.isRunning = false;

    this.videoElement = this.getVideoElement();
    this.previewContainer = document.getElementById('webcam-preview-container');
    this.hands = this.initializeHands();
    this.camera = this.initializeCamera();
  }

  getVideoElement() {
    // Use the preview video element from the template
    const existingVideo = document.getElementById('webcam-preview');
    if (existingVideo) {
      return existingVideo;
    }
    
    // Fallback: create hidden video element
    const video = document.createElement('video');
    video.style.display = 'none';
    video.id = 'input-video';
    document.body.appendChild(video);
    return video;
  }

  initializeHands() {
    const hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    hands.onResults((results) => this.handleResults(results));

    return hands;
  }

  initializeCamera() {
    return new Camera(this.videoElement, {
      onFrame: async () => {
        if (this.isRunning) {
          await this.hands.send({ image: this.videoElement });
        }
      },
      ...CAMERA_DIMENSIONS,
    });
  }

  /**
   * Processes hand detection results and calculates pinch state
   */
  handleResults(results) {
    if (!this.isRunning) return;
    if (!results.multiHandLandmarks?.length) return;

    const landmarks = results.multiHandLandmarks[0];

    // Track middle finger for cursor position
    const trackedTip = landmarks[FINGER_INDICES.MIDDLE_TIP];
    const indexTip = landmarks[FINGER_INDICES.INDEX_TIP];
    const thumbTip = landmarks[FINGER_INDICES.THUMB_TIP];

    // Pinch detection: distance between thumb and index finger
    const distance = Math.hypot(
      thumbTip.x - indexTip.x,
      thumbTip.y - indexTip.y
    );

    this.onHandMove({
      x: trackedTip.x,
      y: trackedTip.y,
      z: trackedTip.z,
      isPinching: distance < PINCH_THRESHOLD,
      pinchDistance: distance
    });
  }

  async start() {
    try {
      await this.camera.start();
      this.isRunning = true;
      
      // Show webcam preview with configured opacity
      if (this.previewContainer) {
        this.previewContainer.classList.remove('hidden');
        this.videoElement.style.opacity = WEBCAM_PREVIEW_OPACITY;
      }
      
      console.log('Hand tracking started');
    } catch (err) {
      console.error('Camera access error:', err);
      alert('Camera access denied. Camera permission is required for gesture control.');
    }
  }

  stop() {
    this.isRunning = false;
    
    // Hide webcam preview
    if (this.previewContainer) {
      this.previewContainer.classList.add('hidden');
    }
    
    console.log('Hand tracking stopped');
  }

  /**
   * Sets the webcam preview opacity (0 to 1)
   */
  setPreviewOpacity(opacity) {
    if (this.videoElement) {
      this.videoElement.style.opacity = Math.max(0, Math.min(1, opacity));
    }
  }
}
