/**
 * Job experience data structure
 */
const jobExperiences = [
    {
        logo: '/images/mage.webp',
        company: 'MAGE Games',
        companyUrl: 'https://www.linkedin.com/company/magegames',
        title: 'Game Developer',
        period: 'Jan 2023 - Present',
        location: 'İzmir, TR',
        description: 'MAGE is a company consisting of sector veterans, enabling game studios to accelerate their production times and create top-tier games.<br><br>→ Technologies: Unity'
    },
    {
        logo: '/images/metazo.webp',
        company: 'Metazo',
        companyUrl: 'https://www.linkedin.com/company/metazo/',
        title: 'Software Developer',
        period: 'Mar 2022 - Jan 2023',
        location: 'Amsterdam, NL',
        description: 'Metazo is a multi-platform Metaverse project.<br><br>- I am responsible for the preparation of the 3D graphics running on the browser and the development of the game mechanics. <br>- I work on the online interaction of users and the sustainability of this interaction.<br>- I also work actively in the field of optimization of graphics and integration with game engines.<br><br>→ Technologies: PlayCanvas, Unity, Unreal Engine 5, Javascript, WebGL, C#, C++'
    },
    {
        logo: '/images/2medya.webp',
        company: '2MEDYA',
        companyUrl: 'https://www.linkedin.com/company/2medya/',
        title: 'Team Lead',
        period: 'Sept 2021 - Mar 2022',
        location: 'Istanbul, TR',
        description: 'I was responsible for the management of the hypercasual game development process. <br><br>- I provided the production of the game development team in accordance with agile manifestos. <br>- At the same time, I was actively worked on hypercasual game development and design.<br><br>→ Technologies: Unity, C#, Agile'
    },
    {
        logo: '/images/tiplay.webp',
        company: 'Tiplay',
        companyUrl: 'https://www.linkedin.com/company/tiplaystudio/',
        title: 'Game Developer',
        period: 'Oct 2020 - Sept 2021',
        location: 'İzmir, TR',
        description: 'Tiplay studio has 2 games that have ranked US Top Charts Action #1 and US Top Charts Action #5. I have developed dozens of hyper casual games here.<br><br>- I worked as a mentor in the intern program.<br>- I made a casual puzzle game.<br>- I developed hyper casual games and special mechanics. <br><br>→ Technologies: Unity, C#, ShaderLab'
    },
    {
        logo: '/images/eic.webp',
        company: 'Eletronic Ice Cream',
        companyUrl: 'https://www.linkedin.com/company/unavailable/',
        title: 'Game Developer',
        period: 'Mar 2020 - Oct 2020',
        location: 'Manisa, TR',
        description: 'I was involved in the start-up, which developed a hypercasual game consisting of 4 people, from its establishment to its sale.<br><br>- I took part in a game project that soft launched.<br>- I developed dozens of hyper casual games with different mechanics.<br>- I made level design for games.<br><br>→ Technologies: Unity, C#, ShaderLab'
    },
    {
        logo: '/images/deu.webp',
        company: 'Dokuz Eylul University',
        companyUrl: 'https://www.linkedin.com/school/dokuz-eylul-university/',
        title: '<strong>B.S. in Computer Engineering, <em>earned Sept 2017</em></strong>',
        period: '',
        location: 'İzmir, TR',
        description: 'Dokuz Eylül University has given me many opportunities during my time. It has broadened my worldview and added vision to me.<br><br>My university has allowed me to develop myself in different engineering disciplines thanks to many professors who are experts in their fields. During my education, I strengthened these skills in line with my interest in algorithms and design. At the end of 4 years, I finished this beautiful adventure by completing the Computer Engineering department with the "first prize for the thesis competition" .<br><br>Dokuz Eyül surrounded me with a passion for learning and dozens of inspiring colleagues.'
    }
];

/**
 * Generates HTML for a single job entry
 */
function createJobHTML(job) {
    const titleContent = job.period
        ? `<h1 class="heading-5">${job.title}, ${job.period}</h1>`
        : `<h1 class="heading-5">${job.title}</h1>`;

    return `
    <div class="job-container">
      <div class="job-row">
        <div class="job-logo">
          <a href="${job.companyUrl}" target="_blank">
            <img src="${job.logo}" loading="lazy" alt="${job.company}">
          </a>
        </div>
        <div class="job-details">
          <h1 class="heading-4"><a href="${job.companyUrl}" target="_blank" class="link">${job.company}</a></h1>
          ${titleContent}
          <h1 class="location">${job.location}</h1>
          <p>${job.description}</p>
        </div>
      </div>
    </div>
  `;
}

/**
 * Resume section template with all job experiences
 */
export const resumeTemplate = `
  <div class="resume-section">
    <h1 class="heading-3">My Journey</h1>
    ${jobExperiences.map(createJobHTML).join('')}
  </div>
`;
