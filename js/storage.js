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

