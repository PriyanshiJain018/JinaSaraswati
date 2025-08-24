// Main App Controller - Fixed with correct paths
import { Router } from './router.js';
import { Storage } from './storage.js';
import { Achievements } from './achievements.js';
import { KarmaVisualizer } from './karma-visualizer.js';
import { UniverseNavigator } from './universe-navigator.js';

class JinasaraswatiApp {
  constructor() {
    this.router = new Router();
    this.storage = new Storage();
    this.achievements = new Achievements();
    this.karmaViz = new KarmaVisualizer();
    this.navigator = new UniverseNavigator();
    
    this.init();
  }
  
  async init() {
    // Hide splash screen
    await this.initializeSplash();
    
    // Load user progress
    this.userData = this.storage.getUserData();
    
    // Initialize soul avatar with current Leśyā
    this.initializeSoulAvatar();
    
    // Setup routing
    this.setupRouting();
    
    // Load daily prashna
    this.loadDailyPrashna();
    
    // Initialize karma particles
    this.karmaViz.init('karma-particles');
    
    // Check for achievements
    this.achievements.check(this.userData);
    
    // Setup event listeners
    this.attachEventListeners();
    
    // Register for push notifications
    this.registerPushNotifications();
  }
  
  initializeSplash() {
    return new Promise(resolve => {
      setTimeout(() => {
        const splash = document.getElementById('splash');
        const app = document.getElementById('app');
        
        splash.style.opacity = '0';
        setTimeout(() => {
          splash.style.display = 'none';
          app.style.display = 'block';
          app.classList.add('fade-in');
          resolve();
        }, 500);
      }, 2000);
    });
  }
  
  initializeSoulAvatar() {
    const soul = document.getElementById('user-soul');
    const lesya = this.userData.currentLesya || 'krishna'; // Default: Black
    
    // Apply Leśyā-based styling
    soul.className = `soul-avatar lesya-${lesya}`;
    
    // Add karma particles based on karma level
    const karmaLevel = this.userData.karmaLevel || 100;
    this.karmaViz.setDensity(karmaLevel);
  }
  
  setupRouting() {
    // Define routes with correct base path
    this.router.addRoute('/JinaSaraswati/', this.renderHome.bind(this));
    this.router.addRoute('/JinaSaraswati/universe/:id', this.renderUniverse.bind(this));
    this.router.addRoute('/JinaSaraswati/chapter/:universe/:chapter', this.renderChapter.bind(this));
    this.router.addRoute('/JinaSaraswati/quiz/:id', this.renderQuiz.bind(this));
    this.router.addRoute('/JinaSaraswati/achievements', this.renderAchievements.bind(this));
    
    // Initialize router
    this.router.init();
  }
  
  renderHome() {
    // Home screen is already in HTML
    this.updateHomeStats();
  }
  
  updateHomeStats() {
    // Update home screen statistics
    console.log('Updating home stats');
  }
  
  async renderUniverse(params) {
    const universeId = params.id;
    const content = await this.navigator.loadUniverse(universeId);
    document.getElementById('router-view').innerHTML = content;
  }
  
  async renderChapter(params) {
    const { universe, chapter } = params;
    
    // Special handling for existing chapters - FIXED PATH
    if (universe === '4' && (chapter === '40' || chapter === '44')) {
      const response = await fetch(`/JinaSaraswati/universes/dravyanuyog/chapters/chapter-${chapter}.html`);
      const content = await response.text();
      
      // Wrap in app container while preserving original content
      const wrappedContent = `
        <div class="chapter-wrapper">
          <button class="back-btn" onclick="history.back()">← वापस</button>
          ${content}
          <div class="chapter-nav">
            <button class="nav-prev">Previous</button>
            <button class="nav-next">Next</button>
          </div>
        </div>
      `;
      
      document.getElementById('router-view').innerHTML = wrappedContent;
      
      // Re-initialize any chapter-specific scripts
      this.initializeChapterInteractivity(chapter);
    }
  }
  
  renderQuiz(params) {
    console.log('Rendering quiz:', params);
  }
  
  renderAchievements() {
    console.log('Rendering achievements');
  }
  
  initializeChapterInteractivity(chapterId) {
    // Add interactivity to existing chapter content
    if (chapterId === '40') {
      // Karma theory specific features
      this.karmaViz.attachToChapter();
    } else if (chapterId === '44') {
      // Six substances specific features
      this.initializeDravyaSorter();
    }
  }
  
  initializeDravyaSorter() {
    console.log('Initializing Dravya Sorter');
  }
  
  loadDailyPrashna() {
    const today = new Date().toDateString();
    const lastPrashna = localStorage.getItem('lastPrashnaDate');
    
    if (lastPrashna !== today) {
      // FIXED PATH - Added /JinaSaraswati/ prefix
      fetch('/JinaSaraswati/data/daily-prashnas.json')
        .then(res => res.json())
        .then(prashnas => {
          const todaysPrashna = prashnas[Math.floor(Math.random() * prashnas.length)];
          const questionElement = document.getElementById('daily-question');
          if (questionElement) {
            questionElement.innerHTML = `
              <p class="question">${todaysPrashna.question}</p>
              <button class="reveal-btn" onclick="app.revealAnswer('${todaysPrashna.id}')">
                उत्तर देखें
              </button>
            `;
          }
          localStorage.setItem('lastPrashnaDate', today);
        })
        .catch(err => {
          console.log('Error loading daily prashna:', err);
        });
    }
  }
  
  revealAnswer(prashnaId) {
    // Implementation for revealing answer
    // Award XP, update progress, etc.
    this.addXP(10);
    this.achievements.unlock('daily_scholar');
  }
  
  addXP(amount) {
    this.userData.xp = (this.userData.xp || 0) + amount;
    this.userData.level = Math.floor(this.userData.xp / 100) + 1;
    
    // Update UI
    this.updateXPBar();
    
    // Check for level up
    if (this.userData.xp % 100 === 0) {
      this.levelUp();
    }
    
    // Save progress
    this.storage.saveUserData(this.userData);
  }
  
  updateXPBar() {
    const xpBar = document.querySelector('.xp-progress');
    if (xpBar) {
      const percentage = (this.userData.xp % 100);
      xpBar.style.width = `${percentage}%`;
    }
  }
  
  levelUp() {
    // Celebration animation
    this.showAchievement({
      title: 'Level Up! 🎉',
      description: `You reached Level ${this.userData.level}!`,
      icon: '⭐'
    });
    
    // Update Leśyā if appropriate
    this.updateLesya();
  }
  
  updateLesya() {
    const lesyaProgression = [
      'krishna',  // Black (worst)
      'nila',     // Blue
      'kapota',   // Grey
      'tejas',    // Red
      'padma',    // Yellow
      'shukla'    // White (best)
    ];
    
    const currentIndex = lesyaProgression.indexOf(this.userData.currentLesya);
    const newIndex = Math.min(
      Math.floor(this.userData.level / 10),
      lesyaProgression.length - 1
    );
    
    if (newIndex > currentIndex) {
      this.userData.currentLesya = lesyaProgression[newIndex];
      this.initializeSoulAvatar();
      this.showAchievement({
        title: 'Leśyā Transformation!',
        description: `Your soul aura evolved to ${this.userData.currentLesya}!`,
        icon: '🌟'
      });
    }
  }
  
  attachEventListeners() {
    // Universe cards
    document.querySelectorAll('.universe-card.unlocked').forEach(card => {
      card.addEventListener('click', (e) => {
        const universeId = e.currentTarget.dataset.universe;
        this.router.navigate(`/JinaSaraswati/universe/${universeId}`);
      });
    });
    
    // PWA install prompt
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      this.showInstallPrompt(deferredPrompt);
    });
  }
  
  registerPushNotifications() {
    // Placeholder for push notifications
    console.log('Push notifications will be registered here');
  }
  
  showInstallPrompt(prompt) {
    const installBanner = document.createElement('div');
    installBanner.className = 'install-banner';
    installBanner.innerHTML = `
      <p>Install जिनसरस्वती app for offline access!</p>
      <button onclick="app.install()">Install</button>
      <button onclick="this.parentElement.remove()">Later</button>
    `;
    document.body.appendChild(installBanner);
    
    this.deferredPrompt = prompt;
  }
  
  async install() {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        this.achievements.unlock('app_installed');
      }
      this.deferredPrompt = null;
    }
  }
  
  showAchievement(achievement) {
    const popup = document.getElementById('achievement-popup');
    if (popup) {
      popup.innerHTML = `
        <div class="achievement-content">
          <span class="achievement-icon">${achievement.icon}</span>
          <div>
            <h4>${achievement.title}</h4>
            <p>${achievement.description}</p>
          </div>
        </div>
      `;
      popup.classList.remove('hidden');
      popup.classList.add('show');
      
      setTimeout(() => {
        popup.classList.remove('show');
        popup.classList.add('hidden');
      }, 3000);
    }
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new JinasaraswatiApp();
});
