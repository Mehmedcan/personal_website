import './style.css'
import { ParticleSystem } from './particles.js'

document.querySelector('#app').innerHTML = `
  <div class="container">
    <h1 class="title">Mehmedcan Özman</h1>
    <p class="subtitle">Developing Games..</p>
  </div>
`

new ParticleSystem();
