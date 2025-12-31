import './style.css'
import { ParticleSystem } from './particles.js'
import { HandTracker } from './handTracker.js'

document.querySelector('#app').innerHTML = `
  <div class="container">
    <div class="emoji-line">👋</div>
    <p class="intro-text">Hey, I am</p>
    <h1 class="title">Mehmedcan Özman</h1>
    
    <div class="social-links">
      <a href="https://github.com/mehmedcan" target="_blank" aria-label="Github">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
      </a>
      
      <a href="https://www.linkedin.com/in/mehmedcan/" target="_blank" aria-label="LinkedIn">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
      </a>
      
      <a href="https://www.instagram.com/mehmedcanozman" target="_blank" aria-label="Instagram">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
      </a>

      <a href="http://x.com/mehmedcanozman" target="_blank" aria-label="X (Twitter)">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z" /><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" /></svg>
      </a>
    </div>
  </div>

  <!-- Resume Section (Scroll down to see) -->
  <div class="resume-section">
    <h1 class="heading-3">My Journey</h1>
    
    <div class="job-container">
      <div class="job-row">
        <div class="job-logo">
          <a href="https://www.linkedin.com/company/magegames" target="_blank">
            <img src="/images/mage.jpg" loading="lazy" alt="MAGE Games">
          </a>
        </div>
        <div class="job-details">
          <h1 class="heading-4"><a href="https://www.linkedin.com/company/magegames" target="_blank" class="link">MAGE Games</a></h1>
          <h1 class="heading-5">Game Developer, Jan 2023 - Present</h1>
          <h1 class="location">İzmir, TR</h1>
          <p>MAGE is a company consisting of sector veterans, enabling game studios to accelerate their production times and create top-tier games.<br><br>→ Technologies: Unity</p>
        </div>
      </div>
    </div>
    
    <div class="job-container">
      <div class="job-row">
        <div class="job-logo">
          <a href="https://www.linkedin.com/company/metazo/" target="_blank">
            <img src="/images/metazo.png" loading="lazy" alt="Metazo">
          </a>
        </div>
        <div class="job-details">
          <h1 class="heading-4"><a href="https://www.linkedin.com/company/metazo/" target="_blank" class="link">Metazo</a></h1>
          <h1 class="heading-5">Software Developer, Mar 2022 - Jan 2023</h1>
          <h1 class="location">Amsterdam, NL</h1>
          <p>Metazo is a multi-platform Metaverse project.<br><br>- I am responsible for the preparation of the 3D graphics running on the browser and the development of the game mechanics. <br>- I work on the online interaction of users and the sustainability of this interaction.<br>- I also work actively in the field of optimization of graphics and integration with game engines.<br><br>→ Technologies: PlayCanvas, Unity, Unreal Engine 5, Javascript, WebGL, C#, C++</p>
        </div>
      </div>
    </div>

    <div class="job-container">
      <div class="job-row">
        <div class="job-logo">
          <a href="https://www.linkedin.com/company/2medya/" target="_blank">
            <img src="/images/2medya.png" loading="lazy" alt="2MEDYA">
          </a>
        </div>
        <div class="job-details">
          <h1 class="heading-4"><a href="https://www.linkedin.com/company/2medya/" target="_blank" class="link">2MEDYA</a></h1>
          <h1 class="heading-5">Team Lead, Sept 2021 - Mar 2022</h1>
          <h1 class="location">Istanbul, TR</h1>
          <p>I was responsible for the management of the hypercasual game development process. <br><br>- I provided the production of the game development team in accordance with agile manifestos. <br>- At the same time, I was actively worked on hypercasual game development and design.<br><br>→ Technologies: Unity, C#, Agile</p>
        </div>
      </div>
    </div>

    <div class="job-container">
      <div class="job-row">
        <div class="job-logo">
          <a href="https://www.linkedin.com/company/tiplaystudio/" target="_blank">
            <img src="/images/tiplay.png" loading="lazy" alt="Tiplay">
          </a>
        </div>
        <div class="job-details">
          <h1 class="heading-4"><a href="https://www.linkedin.com/company/tiplaystudio/" target="_blank" class="link">Tiplay</a></h1>
          <h1 class="heading-5">Game Developer, Oct 2020 - Sept 2021</h1>
          <h1 class="location">İzmir, TR</h1>
          <p>Tiplay studio has 2 games that have ranked US Top Charts Action #1 and US Top Charts Action #5. I have developed dozens of hyper casual games here.<br><br>- I worked as a mentor in the intern program.<br>- I made a casual puzzle game.<br>- I developed hyper casual games and special mechanics. <br><br>→ Technologies: Unity, C#, ShaderLab</p>
        </div>
      </div>
    </div>

    <div class="job-container">
      <div class="job-row">
        <div class="job-logo">
          <a href="https://www.linkedin.com/company/unavailable/" target="_blank">
            <img src="/images/eic.png" loading="lazy" alt="Electronic Ice Cream">
          </a>
        </div>
        <div class="job-details">
          <h1 class="heading-4"><a href="https://www.linkedin.com/company/unavailable/" target="_blank" class="link">Eletronic Ice Cream</a></h1>
          <h1 class="heading-5">Game Developer, Mar 2020 - Oct 2020</h1>
          <h1 class="location">Manisa, TR</h1>
          <p>I was involved in the start-up, which developed a hypercasual game consisting of 4 people, from its establishment to its sale.<br><br>- I took part in a game project that soft launched.<br>- I developed dozens of hyper casual games with different mechanics.<br>- I made level design for games.<br><br>→ Technologies: Unity, C#, ShaderLab</p>
        </div>
      </div>
    </div>

    <div class="job-container">
      <div class="job-row">
        <div class="job-logo">
          <a href="https://www.linkedin.com/school/dokuz-eylul-university/" target="_blank">
            <img src="/images/deu.png" loading="lazy" alt="DEU">
          </a>
        </div>
        <div class="job-details">
          <h1 class="heading-4"><a href="https://www.linkedin.com/school/dokuz-eylul-university/" target="_blank" class="link">Dokuz Eylul University</a></h1>
          <h1 class="heading-5"><strong>B.S. in Computer Engineering, <em>earned Sept 2017</em></strong></h1>
          <h1 class="location">İzmir, TR</h1>
          <p>Dokuz Eylül University has given me many opportunities during my time. It has broadened my worldview and added vision to me.<br><br>My university has allowed me to develop myself in different engineering disciplines thanks to many professors who are experts in their fields. During my education, I strengthened these skills in line with my interest in algorithms and design. At the end of 4 years, I finished this beautiful adventure by completing the Computer Engineering department with the "first prize for the thesis competition" .<br><br>Dokuz Eyül surrounded me with a passion for learning and dozens of inspiring colleagues.</p>
        </div>
      </div>
    </div>
  </div>

  <div class="interest-section">
    <div class="interest-container">
      <h1 class="heading-3">My Interests</h1>
      <div class="interest-row">
        <div class="interest-column">
          <img src="/images/unity.png" loading="lazy" alt="Unity" class="interest-icon">
          <h1 class="interest-title">Unity</h1>
        </div>
        <div class="interest-column">
          <img src="/images/playcanvas.png" loading="lazy" alt="PlayCanvas" class="interest-icon">
          <h1 class="interest-title">PlayCanvas</h1>
        </div>
        <div class="interest-column">
          <img src="/images/unreal.png" loading="lazy" alt="Unreal Engine" class="interest-icon">
          <h1 class="interest-title">Unreal Engine</h1>
        </div>
      </div>
    </div>
  </div>

  <footer class="footer-section">
    <p class="footer-text">© 2025, Mehmedcan, All Rights Reserved.</p>
  </footer>
`

const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 1024;

const particles = new ParticleSystem();

if (!isMobile) {
  // Desktop only UI components
  document.querySelector('#app').insertAdjacentHTML('beforeend', `
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
  `);

  const cursor = document.getElementById('custom-cursor');
  const startBtn = document.getElementById('start-gesture');
  const stopBtn = document.getElementById('stop-gesture');

  // Lerp animasyonu için değişkenler
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  const LERP_FACTOR = 0.15;

  // Scroll kontrolü için değişkenler
  let isPinching = false;
  let pinchInitialX = null;
  let pinchInitialY = null;
  let isPinchScrolling = false;
  let scrollVelocityY = 0;
  const SCROLL_SENSITIVITY = 80;
  const HAND_SENSITIVITY = 2;
  const PINCH_SCROLL_THRESHOLD = 75;
  const FRICTION = 0.96;

  let animationRunning = false;

  function animate() {
    if (!animationRunning) return;

    const prevY = currentY;
    currentX += (targetX - currentX) * LERP_FACTOR;
    currentY += (targetY - currentY) * LERP_FACTOR;

    cursor.style.left = `${currentX}px`;
    cursor.style.top = `${currentY}px`;

    particles.setTarget(currentX, currentY);

    if (isPinching && isPinchScrolling) {
      const deltaY = (prevY - currentY) * (SCROLL_SENSITIVITY / 100);
      if (Math.abs(deltaY) > 0.01) {
        window.scrollBy(0, deltaY);
        scrollVelocityY = deltaY;
      }
    } else if (Math.abs(scrollVelocityY) > 0.1) {
      window.scrollBy(0, scrollVelocityY);
      scrollVelocityY *= FRICTION;
    }

    requestAnimationFrame(animate);
  }

  const tracker = new HandTracker((handPos) => {
    const mirroredX = 1 - handPos.x;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    targetX = centerX + (mirroredX - 0.5) * window.innerWidth * HAND_SENSITIVITY;
    targetY = centerY + (handPos.y - 0.5) * window.innerHeight * HAND_SENSITIVITY;

    cursor.style.display = 'block';

    if (handPos.isPinching) {
      cursor.classList.add('pinching');
      if (!isPinching) {
        scrollVelocityY = 0;
        pinchInitialX = currentX;
        pinchInitialY = currentY;
        isPinchScrolling = false;
      } else if (!isPinchScrolling) {
        const dx = currentX - pinchInitialX;
        const dy = currentY - pinchInitialY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > PINCH_SCROLL_THRESHOLD) {
          isPinchScrolling = true;
        }
      }
      isPinching = true;
    } else {
      if (isPinching && !isPinchScrolling) {
        let targetElement = document.elementFromPoint(currentX, currentY);
        if (!targetElement || !targetElement.closest('a')) {
          const buttons = document.querySelectorAll('.social-links a');
          for (const btn of buttons) {
            const rect = btn.getBoundingClientRect();
            if (currentX >= rect.left && currentX <= rect.right &&
              currentY >= rect.top && currentY <= rect.bottom) {
              targetElement = btn;
              break;
            }
          }
        }
        if (targetElement) {
          const link = targetElement.closest('a');
          if (link && link.href) {
            window.open(link.href, link.target || '_self');
          } else {
            targetElement.click();
          }
        }
      }
      cursor.classList.remove('pinching');
      isPinching = false;
      isPinchScrolling = false;
    }
  });

  startBtn.addEventListener('click', async () => {
    await tracker.start();
    startBtn.style.display = 'none';
    stopBtn.style.display = 'block';
    particles.setIsGestureActive(true);
    document.getElementById('gesture-info-container').classList.add('hidden');
    document.getElementById('gesture-active-info').classList.remove('hidden');
    animationRunning = true;
    animate();
  });

  stopBtn.addEventListener('click', () => {
    tracker.stop();
    stopBtn.style.display = 'none';
    startBtn.style.display = 'block';
    cursor.style.display = 'none';
    animationRunning = false;
    particles.setIsGestureActive(false);
    document.getElementById('gesture-info-container').classList.remove('hidden');
    document.getElementById('gesture-active-info').classList.add('hidden');
    pinchInitialX = null;
    pinchInitialY = null;
    isPinchScrolling = false;
    isPinching = false;
    scrollVelocityY = 0;
  });
}
