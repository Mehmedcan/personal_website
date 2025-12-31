import { Hands } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';

export class HandTracker {
  constructor(onHandMove) {
    this.onHandMove = onHandMove;
    this.isRunning = false;

    this.videoElement = document.createElement('video');
    this.videoElement.style.display = 'none';
    this.videoElement.id = 'input-video';
    document.body.appendChild(this.videoElement);

    this.hands = new Hands({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      },
    });

    this.hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    this.hands.onResults((results) => {
      if (!this.isRunning) return;

      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];

        // İşaret parmağı ucu (landmarks[8]) pozisyonu
        const indexTip = landmarks[8];
        // Baş parmak ucu (landmarks[4]) pozisyonu
        const thumbTip = landmarks[4];

        // Pinch algılama: baş parmak ve işaret parmağı arasındaki mesafe
        const distance = Math.sqrt(
          Math.pow(thumbTip.x - indexTip.x, 2) +
          Math.pow(thumbTip.y - indexTip.y, 2)
        );

        // Pinch eşik değeri (deneysel olarak ayarlandı)
        const PINCH_THRESHOLD = 0.06;
        const isPinching = distance < PINCH_THRESHOLD;

        const handPosition = {
          x: indexTip.x,
          y: indexTip.y,
          z: indexTip.z,
          isPinching: isPinching,
          pinchDistance: distance
        };

        this.onHandMove(handPosition);
      }
    });

    this.camera = new Camera(this.videoElement, {
      onFrame: async () => {
        if (this.isRunning) {
          await this.hands.send({ image: this.videoElement });
        }
      },
      width: 640,
      height: 480,
    });
  }

  async start() {
    try {
      await this.camera.start();
      this.isRunning = true;
      console.log('Camera started');
    } catch (err) {
      console.error('Error starting camera:', err);
      alert('Kamera erişimi reddedildi. Gesture kontrolü için kamera izni gereklidir.');
    }
  }

  stop() {
    this.isRunning = false;
    console.log('Gesture tracking stopped');
  }
}
