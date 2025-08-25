// app.js - Main Application Logic
import { Router } from './router.js';
import { State } from './state.js';
import { KarmaVisualizer } from '../modules/karma-visualizer.js';
import { DailyPrashna } from '../modules/daily-prashna.js';
import { Achievements } from '../modules/achievements.js';

class JinaSaraswatiApp {
    constructor() {
        this.state = new State();
        this.router = new Router();
        this.karmaViz = null;
        this.dailyPrashna = null;
        this.achievements = null;
        this.currentLanguage = localStorage.getItem('language') || 'en';
        this.universes = [
            {
                id: 'prathamanuyoga',
                name: { en: 'Prathamānuyoga', hi: 'प्रथमानुयोग' },
                subtitle: { en: 'Universe of Narratives', hi: 'कथाओं का ब्रह्मांड' },
                description: { en: 'Learn through stories of Tīrthaṅkaras', hi: 'तीर्थंकरों की कथाओं से सीखें' },
                color: '#8B4513',
                icon: '📚',
                locked: false,
                progress: 0,
                stages: [
                    { id: 'stage1', name: 'The First Tīrthaṅkara', chapters: ['ch1', 'ch7'] },
                    { id: 'stage2', name: 'The Last Two Tīrthaṅkaras', chapters: ['ch8', 'ch9'] }
                ]
            },
            {
                id: 'karananuyoga',
                name: { en: 'Karaṇānuyoga', hi: 'करणानुयोग' },
                subtitle: { en: 'Universe of Cosmology', hi: 'ब्रह्मांड विज्ञान' },
                description: { en: 'Explore Jain geography & cosmos', hi: 'जैन भूगोल और ब्रह्मांड का अन्वेषण' },
                color: '#4682B4',
                icon: '🌌',
                locked: true,
                progress: 0,
                stages: [
                    { id: 'stage1', name: 'Structure of Universe', chapters: ['ch15', 'ch16'] },
                    { id: 'stage2', name: 'Three Higher Realms', chapters: ['ch18', 'ch19'] }
                ]
            },
            {
                id: 'charananuyoga',
                name: { en: 'Charaṇānuyoga', hi: 'चरणानुयोग' },
                subtitle: { en: 'Universe of Conduct', hi: 'आचरण का ब्रह्मांड' },
                description: { en: 'Ethics for householders', hi: 'गृहस्थों के लिए नैतिकता' },
                color: '#228B22',
                icon: '⚖️',
                locked: true,
                progress: 0,
                stages: [
                    { id: 'stage1', name: 'Five Vows', chapters: [] },
                    { id: 'stage2', name: 'Twelve Vows', chapters: [] }
                ]
            },
            {
                id: 'dravyanuyoga',
                name: { en: 'Dravyānuyoga', hi: 'द्रव्यानुयोग' },
                subtitle: { en: 'Universe of Reality', hi: 'तत्त्व का ब्रह्मांड' },
                description: { en: 'Fundamental substances & metaphysics', hi: 'मौलिक द्रव्य और तत्त्वमीमांसा' },
                color: '#9370DB',
                icon: '🔮',
                locked: true,
                progress: 25, // Since we have chapters 40 & 42
                stages: [
                    { id: 'stage1', name: 'Eight Types of Karma', chapters: ['chapter-40'] },
                    { id: 'stage2', name: 'Nokashayas & Soul States', chapters: ['chapter-42'] }
                ]
            }
        ];
        
        this.init();
    }
    
    async init() {
        // Initialize modules
        this.karmaViz = new KarmaVisualizer('karma-canvas');
        this.dailyPrashna = new DailyPrashna();
        this.achievements = new Achievements();
        
        // Load user progress
        await this.loadUserProgress();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initialize UI
        this.updateUI();
        
        // Load universes
        this.renderUniverses();
        
        // Check for install prompt
        this.setupInstallPrompt();
        
        // Initialize daily prashna
        await this.dailyPrashna.loadTodaysQuestion();
        
        // Start karma animation
        this.karmaViz.startAnimation();
        
        // Check achievements
        this.checkAchievements();
    }
    
    setupEventListeners() {
        // Menu toggle
        document.getElementById('menu-toggle')?.addEventListener('click', () => {
            this.toggleMenu();
        });
        
        // Menu overlay
        document.getElementById('menu-overlay')?.addEventListener('click', () => {
            this.closeMenu();
        });
        
        // Language toggle
        document.getElementById('lang-toggle')?.addEventListener('click', () => {
            this.toggleLanguage();
        });
        
        // Bottom navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                this.navigateToScreen(e.currentTarget.dataset.screen);
            });
        });
        
        // Daily Prashna reveal
        document.getElementById('reveal-answer')?.addEventListener('click', () => {
            this.revealDailyAnswer();
        });
        
        // Universe cards (will be set after rendering)
    }
    
    renderUniverses() {
        const grid = document.getElementById('universe-grid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        this.universes.forEach(universe => {
            const card = this.createUniverseCard(universe);
            grid.appendChild(card);
        });
    }
    
    createUniverseCard(universe) {
        const card = document.createElement('div');
        card.className = `universe-card ${universe.locked ? 'locked' : 'unlocked'}`;
        card.style.background = `linear-gradient(135deg, ${universe.color}, ${this.lightenColor(universe.color, 30)})`;
        
        const isLocked = universe.locked && universe.id !== 'dravyanuyoga'; // Dravyanuyoga has content
        
        card.innerHTML = `
            <div class="universe-header">
                <span class="universe-icon">${universe.icon}</span>
                ${isLocked ? '<span class="lock-badge">🔒</span>' : ''}
            </div>
            <h3 class="universe-name">${universe.name[this.currentLanguage]}</h3>
            <p class="universe-subtitle">${universe.subtitle[this.currentLanguage]}</p>
            <p class="universe-desc">${universe.description[this.currentLanguage]}</p>
            <div class="universe-footer">
                <div class="progress-mini">
                    <div class="progress-bar-mini">
                        <div class="progress-fill-mini" style="width: ${universe.progress}%"></div>
                    </div>
                    <span class="progress-text">${universe.progress}%</span>
                </div>
                ${!isLocked ? `<button class="explore-btn">Explore →</button>` : ''}
            </div>
        `;
        
        if (!isLocked) {
            card.addEventListener('click', () => {
                this.openUniverse(universe);
            });
        } else {
            card.addEventListener('click', () => {
                this.showLockedMessage(universe);
            });
        }
        
        return card;
    }
    
    openUniverse(universe) {
        if (universe.id === 'dravyanuyoga') {
            // Special handling for Dravyanuyoga with existing chapters
            this.openDravyanuyogaUniverse();
        } else {
            // Navigate to universe view
            this.router.navigate(`/universe/${universe.id}`);
            this.showUniverseContent(universe);
        }
    }
    
    openDravyanuyogaUniverse() {
        const content = `
            <div class="universe-detail">
                <div class="universe-banner" style="background: linear-gradient(135deg, #9370DB, #8A2BE2);">
                    <button class="back-btn" onclick="app.navigateToScreen('home')">← Back</button>
                    <h1>🔮 Dravyānuyoga</h1>
                    <p>The Universe of Reality - Explore the fundamental substances</p>
                </div>
                
                <div class="stages-container">
                    <div class="stage-card">
                        <h2>Stage 1: Eight Types of Karma</h2>
                        <p>Understand how karma binds the soul and affects spiritual progress</p>
                        <div class="chapter-list">
                            <button class="chapter-btn" onclick="app.loadChapter('chapter-40')">
                                <span class="chapter-icon">📖</span>
                                <div>
                                    <h3>Chapter 40: Aṣṭa Karma</h3>
                                    <p>The Eight Types of Karma</p>
                                </div>
                                <span class="progress-badge">Interactive</span>
                            </button>
                        </div>
                    </div>
                    
                    <div class="stage-card">
                        <h2>Stage 2: Subtle Passions & Soul States</h2>
                        <p>Learn about Nokashayas and the journey of consciousness</p>
                        <div class="chapter-list">
                            <button class="chapter-btn" onclick="app.loadChapter('chapter-42')">
                                <span class="chapter-icon">📖</span>
                                <div>
                                    <h3>Chapter 42: Nokashaya</h3>
                                    <p>The Nine Subtle Passions</p>
                                </div>
                                <span class="progress-badge">Interactive</span>
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="universe-features">
                    <h3>🎮 Features in this Universe:</h3>
                    <ul>
                        <li>Interactive Karma Visualizer</li>
                        <li>Soul State Simulator</li>
                        <li>Dravya Sorting Game</li>
                        <li>Tattva Builder Experience</li>
                        <li>Real-time Leshya Color Changes</li>
                    </ul>
                </div>
            </div>
        `;
        
        document.getElementById('universe-view').innerHTML = content;
        this.navigateToScreen('universe-view');
    }
    
    loadChapter(chapterId) {
        const chapterFrame = document.getElementById('chapter-frame');
        chapterFrame.src = `universes/dravyanuyoga/${chapterId}.html`;
        this.navigateToScreen('chapter-view');
        
        // Add XP for opening chapter
        this.state.addXP(5);
        this.updateUI();
    }
    
    showUniverseContent(universe) {
        // Implementation for other universes
        const view = document.getElementById('universe-view');
        view.innerHTML = `
            <div class="universe-detail">
                <button class="back-btn" onclick="app.navigateToScreen('home')">← Back</button>
                <h1>${universe.icon} ${universe.name[this.currentLanguage]}</h1>
                <p>${universe.description[this.currentLanguage]}</p>
                <div class="coming-soon">
                    <h2>Coming Soon!</h2>
                    <p>This universe is under development. Check back later!</p>
                </div>
            </div>
        `;
        this.navigateToScreen('universe-view');
    }
    
    showLockedMessage(universe) {
        this.showAchievement('Locked Universe', `Complete previous universes to unlock ${universe.name[this.currentLanguage]}`, '🔒');
    }
    
    navigateToScreen(screenName) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.style.display = 'none';
            screen.classList.remove('active');
        });
        
        // Show selected screen
        const targetScreen = document.getElementById(`${screenName}-screen`) || 
                           document.getElementById(screenName.replace('-screen', '-view'));
        if (targetScreen) {
            targetScreen.style.display = 'block';
            targetScreen.classList.add('active');
        }
        
        // Update nav
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.screen === screenName.replace('-screen', '')) {
                item.classList.add('active');
            }
        });
    }
    
    toggleMenu() {
        const menu = document.getElementById('side-menu');
        const overlay = document.getElementById('menu-overlay');
        menu.classList.toggle('open');
        overlay.classList.toggle('visible');
    }
    
    closeMenu() {
        const menu = document.getElementById('side-menu');
        const overlay = document.getElementById('menu-overlay');
        menu.classList.remove('open');
        overlay.classList.remove('visible');
    }
    
    toggleLanguage() {
        this.currentLanguage = this.currentLanguage === 'en' ? 'hi' : 'en';
        localStorage.setItem('language', this.currentLanguage);
        document.getElementById('current-lang').textContent = this.currentLanguage.toUpperCase();
        this.renderUniverses();
        this.updateUI();
    }
    
    async revealDailyAnswer() {
        const answerContainer = document.getElementById('answer-container');
        const revealBtn = document.getElementById('reveal-answer');
        
        answerContainer.style.display = 'block';
        revealBtn.style.display = 'none';
        
        // Award XP
        this.state.addXP(10);
        this.updateUI();
        
        // Show achievement
        this.showAchievement('Daily Wisdom', 'You earned 10 XP!', '📜');
        
        // Update streak
        this.state.updateStreak();
    }
    
    updateUI() {
        // Update XP display
        document.getElementById('user-xp').textContent = this.state.user.xp;
        
        // Update level
        document.getElementById('user-level').textContent = this.state.user.level;
        
        // Update progress bar
        const progress = (this.state.user.xp % 100);
        document.getElementById('progress-fill').style.width = `${progress}%`;
        
        // Update streak
        document.getElementById('streak-count').textContent = this.state.user.streak;
        
        // Update stats
        document.getElementById('total-chapters').textContent = this.state.user.completedChapters.length;
        document.getElementById('total-badges').textContent = this.state.user.achievements.length;
        document.getElementById('karma-score').textContent = this.state.user.karmaScore || 0;
    }
    
    async loadUserProgress() {
        // Load from localStorage
        const saved = localStorage.getItem('jinasaraswati_progress');
        if (saved) {
            const data = JSON.parse(saved);
            this.state.user = { ...this.state.user, ...data };
        }
    }
    
    checkAchievements() {
        // Check for various achievements
        if (this.state.user.streak >= 7 && !this.state.hasAchievement('week_warrior')) {
            this.achievements.unlock('week_warrior');
            this.showAchievement('Week Warrior', '7 day streak achieved!', '🔥');
        }
        
        if (this.state.user.level >= 5 && !this.state.hasAchievement('level_5')) {
            this.achievements.unlock('level_5');
            this.showAchievement('Rising Seeker', 'Reached Level 5!', '⭐');
        }
    }
    
    showAchievement(title, description, icon = '🏆') {
        const popup = document.getElementById('achievement-popup');
        document.getElementById('achievement-title').textContent = title;
        document.getElementById('achievement-desc').textContent = description;
        document.querySelector('.achievement-icon').textContent = icon;
        
        popup.classList.add('show');
        setTimeout(() => {
            popup.classList.remove('show');
        }, 3000);
    }
    
    setupInstallPrompt() {
        let deferredPrompt;
        
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            
            // Show install prompt after 30 seconds
            setTimeout(() => {
                document.getElementById('install-prompt').style.display = 'block';
            }, 30000);
        });
        
        document.getElementById('install-now')?.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted') {
                    this.showAchievement('App Installed', 'Welcome to the full experience!', '📱');
                }
                deferredPrompt = null;
            }
            document.getElementById('install-prompt').style.display = 'none';
        });
        
        document.getElementById('install-later')?.addEventListener('click', () => {
            document.getElementById('install-prompt').style.display = 'none';
        });
    }
    
    lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255))
            .toString(16).slice(1);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new JinaSaraswatiApp();
});

// Export for modules
export default JinaSaraswatiApp;
