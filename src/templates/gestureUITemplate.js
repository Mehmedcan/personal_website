/**
 * Gesture control UI components template (desktop only)
 */
export const gestureUITemplate = `
  <div id="custom-cursor"></div>
  <div id="gesture-info-container">
    <div class="gesture-info-box">
      Enables webcam-based hand tracking, allowing you to control the interface using pinch gestures.
    </div>
    <div class="gesture-info-arrow">
      <img src="/images/arrow.png" alt="pointing arrow">
    </div>
  </div>
  <div id="gesture-active-info" class="hidden">
    <div class="active-info-box">
      <img src="/images/pinch.png" alt="pinch gesture" class="pinch-icon">
      <p>Pinch & hold to scroll the page.<br>Pinch to click buttons.</p>
    </div>
  </div>
  <button id="start-gesture" class="gesture-btn">Start Gesture Control</button>
  <button id="stop-gesture" class="gesture-btn stop" style="display: none;">Stop Gesture Control</button>
`;
