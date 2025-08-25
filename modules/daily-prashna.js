export class DailyPrashna {
    constructor() {
        this.questions = [
            {
                question: "What are the five main vows of Jainism?",
                answer: "Ahimsa, Satya, Asteya, Brahmacharya, Aparigraha"
            },
            {
                question: "Who was the first Tirthankara?",
                answer: "Lord Rishabhadeva (Adinath)"
            }
        ];
    }
    
    async loadTodaysQuestion() {
        const today = new Date().toDateString();
        const index = today.length % this.questions.length;
        const q = this.questions[index];
        
        const questionEl = document.getElementById('daily-question');
        const answerEl = document.getElementById('daily-answer');
        
        if (questionEl) questionEl.textContent = q.question;
        if (answerEl) answerEl.textContent = q.answer;
    }
}
