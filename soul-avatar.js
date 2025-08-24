// js/soul-avatar.js
export class SoulAvatar {
  constructor(elementId) {
    this.element = document.getElementById(elementId);
    this.lesya = 'krishna';
    this.karmaParticles = [];
    this.init();
  }
  
  init() {
    if (!this.element) return;
    
    this.element.classList.add('soul-avatar', `lesya-${this.lesya}`);
    this.createAura();
    this.addInteractivity();
  }
  
  createAura() {
    const aura = document.createElement('div');
    aura.className = 'soul-aura';
    aura.style.cssText = `
      position: absolute;
      width: 120%;
      height: 120%;
      top: -10%;
      left: -10%;
      border-radius: 50%;
      pointer-events: none;
      opacity: 0.5;
    `;
    
    this.updateAuraColor(aura);
    this.element.appendChild(aura);
  }
  
  updateAuraColor(aura) {
    const colors = {
      krishna: 'radial-gradient(circle, rgba(0,0,0,0.5), transparent)',
      nila: 'radial-gradient(circle, rgba(0,0,139,0.5), transparent)',
      kapota: 'radial-gradient(circle, rgba(112,128,144,0.5), transparent)',
      tejas: 'radial-gradient(circle, rgba(220,20,60,0.5), transparent)',
      padma: 'radial-gradient(circle, rgba(255,215,0,0.5), transparent)',
      shukla: 'radial-gradient(circle, rgba(255,255,255,0.8), transparent)'
    };
    
    aura.style.background = colors[this.lesya];
  }
  
  addInteractivity() {
    this.element.addEventListener('click', () => {
      this.pulse();
      this.shedKarma();
    });
    
    this.element.addEventListener('mouseenter', () => {
      this.element.style.transform = 'scale(1.1)';
    });
    
    this.element.addEventListener('mouseleave', () => {
      this.element.style.transform = 'scale(1)';
    });
  }
  
  pulse() {
    this.element.classList.add('pulse-animation');
    setTimeout(() => {
      this.element.classList.remove('pulse-animation');
    }, 1000);
  }
  
  shedKarma() {
    for (let i = 0; i < 5; i++) {
      const particle = document.createElement('div');
      particle.className = 'karma-particle shedding';
      particle.style.cssText = `
        position: absolute;
        width: 4px;
        height: 4px;
        background: ${this.getRandomKarmaColor()};
        border-radius: 50%;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        pointer-events: none;
      `;
      
      this.element.appendChild(particle);
      
      setTimeout(() => {
        particle.remove();
      }, 1000);
    }
  }
  
  getRandomKarmaColor() {
    const colors = ['#6B46C1', '#9333EA', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6', '#059669', '#DC2626'];
    return colors[Math.floor(Math.random() * colors.length)];
  }
  
  transformLesya(newLesya) {
    const oldLesya = this.lesya;
    this.lesya = newLesya;
    
    this.element.classList.remove(`lesya-${oldLesya}`);
    this.element.classList.add(`lesya-${newLesya}`);
    
    const aura = this.element.querySelector('.soul-aura');
    if (aura) {
      this.updateAuraColor(aura);
    }
    
    // Celebration effect
    this.celebrateTransformation();
  }
  
  celebrateTransformation() {
    const burst = document.createElement('div');
    burst.style.cssText = `
      position: absolute;
      width: 200%;
      height: 200%;
      top: -50%;
      left: -50%;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255,215,0,0.8), transparent);
      animation: starBurst 1s ease-out forwards;
      pointer-events: none;
    `;
    
    this.element.appendChild(burst);
    
    setTimeout(() => {
      burst.remove();
    }, 1000);
  }
}
