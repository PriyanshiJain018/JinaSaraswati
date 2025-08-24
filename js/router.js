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
