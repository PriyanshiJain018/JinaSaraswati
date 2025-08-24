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
