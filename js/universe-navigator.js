// js/universe-navigator.js
export class UniverseNavigator {
  constructor() {
    this.universes = {
      1: {
        id: 1,
        name: 'प्रथमानुयोग',
        subtitle: 'Universe of Narratives',
        locked: true,
        chapters: []
      },
      2: {
        id: 2,
        name: 'करणानुयोग',
        subtitle: 'Universe of Cosmology',
        locked: true,
        chapters: []
      },
      3: {
        id: 3,
        name: 'चरणानुयोग',
        subtitle: 'Universe of Conduct',
        locked: true,
        chapters: []
      },
      4: {
        id: 4,
        name: 'द्रव्यानुयोग',
        subtitle: 'Universe of Reality',
        locked: false,
        chapters: [
          { id: 40, name: 'कर्म सिद्धांत', available: true },
          { id: 44, name: 'षड् द्रव्य', available: true }
        ]
      }
    };
  }
  
  async loadUniverse(universeId) {
    const universe = this.universes[universeId];
    if (!universe || universe.locked) {
      return '<div class="error">Universe not available</div>';
    }
    
    return `
      <div class="universe-detail">
        <div class="universe-header">
          <button class="back-btn" onclick="history.back()">← वापस</button>
          <h1>${universe.name}</h1>
          <p>${universe.subtitle}</p>
        </div>
        
        <div class="chapters-grid">
          ${universe.chapters.map(chapter => `
            <div class="chapter-card ${chapter.available ? 'available' : 'locked'}" 
                 onclick="${chapter.available ? `app.router.navigate('/chapter/4/${chapter.id}')` : ''}">
              <div class="chapter-number">अध्याय ${chapter.id}</div>
              <h3>${chapter.name}</h3>
              ${!chapter.available ? '<span class="lock-icon">🔒</span>' : ''}
              <div class="chapter-progress">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: 0%"></div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
        
        <div class="universe-stats">
          <div class="stat-card">
            <span class="stat-icon">📚</span>
            <span class="stat-value">${universe.chapters.length}</span>
            <span class="stat-label">Chapters</span>
          </div>
          <div class="stat-card">
            <span class="stat-icon">⏱️</span>
            <span class="stat-value">2-3</span>
            <span class="stat-label">Hours</span>
          </div>
          <div class="stat-card">
            <span class="stat-icon">🏆</span>
            <span class="stat-value">200</span>
            <span class="stat-label">XP</span>
          </div>
        </div>
      </div>
    `;
  }
  
  getChapterUrl(universeId, chapterId) {
    return `/universes/dravyanuyog/chapters/chapter-${chapterId}.html`;
  }
  
  unlockUniverse(universeId) {
    if (this.universes[universeId]) {
      this.universes[universeId].locked = false;
      return true;
    }
    return false;
  }
  
  getUniverseProgress(universeId) {
    const universe = this.universes[universeId];
    if (!universe) return 0;
    
    const completedChapters = this.getCompletedChapters(universeId);
    const totalChapters = universe.chapters.length;
    
    return totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;
  }
  
  getCompletedChapters(universeId) {
    const userData = JSON.parse(localStorage.getItem('jinasaraswati_userData') || '{}');
    const completed = userData.completedChapters || [];
    
    return completed.filter(chapterId => chapterId.startsWith(`${universeId}_`)).length;
  }
}
