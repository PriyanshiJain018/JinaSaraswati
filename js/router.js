export class Router {
    constructor() {
        this.routes = {};
        this.init();
    }
    
    init() {
        window.addEventListener('popstate', () => this.handleRoute());
        this.handleRoute();
    }
    
    handleRoute() {
        const path = window.location.pathname.replace('/JinaSaraswati', '') || '/';
        console.log('Routing to:', path);
    }
    
    navigate(path) {
        window.history.pushState({}, '', `/JinaSaraswati${path}`);
        this.handleRoute();
    }
}
