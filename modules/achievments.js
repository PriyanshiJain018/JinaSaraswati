export class Achievements {
    constructor() {
        this.definitions = [
            { id: 'first_step', name: 'First Step', icon: '👣', xp: 10 },
            { id: 'week_warrior', name: 'Week Warrior', icon: '🔥', xp: 50 }
        ];
    }
    
    unlock(achievementId) {
        console.log('Achievement unlocked:', achievementId);
    }
}
