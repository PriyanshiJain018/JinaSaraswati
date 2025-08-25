export class State {
    constructor() {
        this.user = {
            level: 1,
            xp: 0,
            streak: 0,
            achievements: [],
            completedChapters: [],
            karmaScore: 0,
            leshyaState: 'shukla'
        };
        this.load();
    }
    
    load() {
        const saved = localStorage.getItem('jinasaraswati_state');
        if (saved) {
            this.user = JSON.parse(saved);
        }
    }
    
    save() {
        localStorage.setItem('jinasaraswati_state', JSON.stringify(this.user));
    }
    
    addXP(amount) {
        this.user.xp += amount;
        const newLevel = Math.floor(this.user.xp / 100) + 1;
        if (newLevel > this.user.level) {
            this.user.level = newLevel;
        }
        this.save();
    }
    
    updateStreak() {
        this.user.streak++;
        this.save();
    }
    
    hasAchievement(id) {
        return this.user.achievements.includes(id);
    }
}
