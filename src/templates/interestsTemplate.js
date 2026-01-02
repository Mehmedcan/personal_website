/**
 * Interests data structure
 */
const interests = [
    { icon: '/images/unity.webp', title: 'Unity' },
    { icon: '/images/playcanvas.webp', title: 'PlayCanvas' },
    { icon: '/images/unreal.webp', title: 'Unreal Engine' }
];

/**
 * Generates HTML for a single interest item
 */
function createInterestHTML(interest) {
    return `
    <div class="interest-column">
      <img src="${interest.icon}" loading="lazy" alt="${interest.title}" class="interest-icon">
      <h1 class="interest-title">${interest.title}</h1>
    </div>
  `;
}

/**
 * Interests section template
 */
export const interestsTemplate = `
  <div class="interest-section">
    <div class="interest-container">
      <h1 class="heading-3">My Interests</h1>
      <div class="interest-row">
        ${interests.map(createInterestHTML).join('')}
      </div>
    </div>
  </div>
`;
