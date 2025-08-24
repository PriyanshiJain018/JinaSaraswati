// js/router.js
export class Router {
  constructor() {
    this.routes = {};
    this.currentRoute = null;
  }
  
  addRoute(path, handler) {
    this.routes[path] = handler;
  }
  
  init() {
    window.addEventListener('popstate', () => {
      this.handleRoute(window.location.pathname);
    });
    this.handleRoute(window.location.pathname);
  }
  
  navigate(path) {
    window.history.pushState({}, '', path);
    this.handleRoute(path);
  }
  
  handleRoute(path) {
    const { route, params } = this.parsePath(path);
    
    if (this.routes[route]) {
      this.currentRoute = route;
      this.routes[route](params);
    } else {
      for (const [routePattern, handler] of Object.entries(this.routes)) {
        const match = this.matchRoute(routePattern, path);
        if (match) {
          this.currentRoute = routePattern;
          handler(match);
          return;
        }
      }
      this.navigate('/');
    }
  }
  
  parsePath(path) {
    const parts = path.split('/').filter(Boolean);
    const params = {};
    const queryIndex = path.indexOf('?');
    
    if (queryIndex > -1) {
      const queryString = path.substring(queryIndex + 1);
      const pairs = queryString.split('&');
      pairs.forEach(pair => {
        const [key, value] = pair.split('=');
        params[key] = decodeURIComponent(value);
      });
    }
    
    return { route: path.split('?')[0], params };
  }
  
  matchRoute(pattern, path) {
    const patternParts = pattern.split('/').filter(Boolean);
    const pathParts = path.split('/').filter(Boolean);
    
    if (patternParts.length !== pathParts.length) return null;
    
    const params = {};
    
    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(':')) {
        const paramName = patternParts[i].substring(1);
        params[paramName] = pathParts[i];
      } else if (patternParts[i] !== pathParts[i]) {
        return null;
      }
    }
    
    return params;
  }
}

// js/storage.js
export class Storage {
  constructor() {
    this.prefix = 'jinasaraswati_';
  }
  
  getUserData() {
    const data = this.get('userData');
    return data || this.getDefaultUserData();
  }
  
  getDefaultUserData() {
    return {
      id: this.generateUserId(),
      name: 'साधक',
      xp: 0,
      level: 1,
      currentLesya: 'krishna',
      karmaLevel: 100,
      achievements: [],
      unlockedUniverses: [4],
      completedChapters: [],
      dailyStreak: 0,
      lastVisit: new Date().toISOString(),
      preferences: {
        language: 'hi',
        notifications: true,
        soundEffects: true,
        theme: 'light'
      },
      stats: {
        totalQuizzes: 0,
        correctAnswers: 0,
        totalMeditation: 0,
        karmaReduced: 0
      }
    };
  }
  
  generateUserId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
  
  saveUserData(data) {
    data.lastVisit = new Date().toISOString();
    this.set('userData', data);
    
    if (navigator.onLine && 'serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        return registration.sync.register('sync-progress');
      }).catch(e => console.log('Sync registration failed:', e));
    }
  }
  
  get(key) {
    try {
      const item = localStorage.getItem(this.prefix + key);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      console.error('Storage get error:', e);
      return null;
    }
  }
  
  set(key, value) {
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Storage set error:', e);
      return false;
    }
  }
  
  remove(key) {
    localStorage.removeItem(this.prefix + key);
  }
  
  clear() {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    });
  }
  
  markChapterComplete(universeId, chapterId) {
    const userData = this.getUserData();
    const chapterKey = `${universeId}_${chapterId}`;
    
    if (!userData.completedChapters.includes(chapterKey)) {
      userData.completedChapters.push(chapterKey);
      userData.xp += 50;
      this.saveUserData(userData);
    }
  }
  
  getChapterProgress(universeId, chapterId) {
    const key = `chapter_${universeId}_${chapterId}`;
    return this.get(key) || {
      started: false,
      completed: false,
      quizScore: 0,
      timeSpent: 0,
      lastAccessed: null
    };
  }
  
  saveChapterProgress(universeId, chapterId, progress) {
    const key = `chapter_${universeId}_${chapterId}`;
    progress.lastAccessed = new Date().toISOString();
    this.set(key, progress);
  }
}

// js/achievements.js
export class Achievements {
  constructor() {
    this.definitions = this.loadDefinitions();
    this.storage = new Storage();
  }
  
  loadDefinitions() {
    return {
      first_step: {
        id: 'first_step',
        name: 'प्रथम कदम',
        description: 'Complete your first lesson',
        icon: '👣',
        xp: 10,
        category: 'learning'
      },
      daily_scholar: {
        id: 'daily_scholar',
        name: 'नित्य विद्वान',
        description: 'Answer daily Prashna for 7 days',
        icon: '📚',
        xp: 50,
        category: 'daily'
      },
      karma_master: {
        id: 'karma_master',
        name: 'कर्म विजेता',
        description: 'Complete Chapter 40',
        icon: '🎯',
        xp: 100,
        category: 'chapter'
      },
      dravya_expert: {
        id: 'dravya_expert',
        name: 'द्रव्य विशेषज्ञ',
        description: 'Complete Chapter 44',
        icon: '💎',
        xp: 100,
        category: 'chapter'
      },
      level_5: {
        id: 'level_5',
        name: 'श्रावक',
        description: 'Reach Level 5',
        icon: '⭐',
        xp: 25,
        category: 'progress'
      },
      level_10: {
        id: 'level_10',
        name: 'साधक',
        description: 'Reach Level 10',
        icon: '🌟',
        xp: 50,
        category: 'progress'
      },
      karma_reducer: {
        id: 'karma_reducer',
        name: 'निर्जरा साधक',
        description: 'Shed 1000 karma particles',
        icon: '🍃',
        xp: 75,
        category: 'karma'
      },
      lesya_transform: {
        id: 'lesya_transform',
        name: 'लेश्या परिवर्तन',
        description: 'Transform your Leśyā color',
        icon: '🌈',
        xp: 150,
        category: 'spiritual'
      },
      app_installed: {
        id: 'app_installed',
        name: 'गृह स्थापना',
        description: 'Install the app',
        icon: '📱',
        xp: 25,
        category: 'special'
      }
    };
  }
  
  check(userData) {
    const newAchievements = [];
    
    if (userData.level >= 5 && !this.hasAchievement(userData, 'level_5')) {
      newAchievements.push('level_5');
    }
    if (userData.level >= 10 && !this.hasAchievement(userData, 'level_10')) {
      newAchievements.push('level_10');
    }
    if (userData.dailyStreak >= 7 && !this.hasAchievement(userData, 'daily_scholar')) {
      newAchievements.push('daily_scholar');
    }
    if (userData.stats?.karmaReduced >= 1000 && !this.hasAchievement(userData, 'karma_reducer')) {
      newAchievements.push('karma_reducer');
    }
    
    newAchievements.forEach(achievementId => {
      this.unlock(achievementId);
    });
    
    return newAchievements;
  }
  
  hasAchievement(userData, achievementId) {
    return userData.achievements && userData.achievements.includes(achievementId);
  }
  
  unlock(achievementId) {
    const achievement = this.definitions[achievementId];
    if (!achievement) return;
    
    const userData = this.storage.getUserData();
    
    if (userData.achievements.includes(achievementId)) return;
    
    userData.achievements.push(achievementId);
    userData.xp += achievement.xp;
    
    this.storage.saveUserData(userData);
    
    if (window.app) {
      window.app.showAchievement(achievement);
    }
    
    this.playAchievementSound();
    
    return achievement;
  }
  
  playAchievementSound() {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn');
    audio.volume = 0.3;
    audio.play().catch(e => console.log('Audio play failed:', e));
  }
  
  getProgress() {
    const userData = this.storage.getUserData();
    const total = Object.keys(this.definitions).length;
    const unlocked = userData.achievements.length;
    
    return {
      total,
      unlocked,
      percentage: Math.round((unlocked / total) * 100),
      achievements: userData.achievements.map(id => this.definitions[id])
    };
  }
}
