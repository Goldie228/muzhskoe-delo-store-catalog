
import { Views } from './views.js';

/**
 * Роутер
 */
class Router {
    constructor() {
        this.routes = {};
        window.addEventListener('hashchange', () => this.handleRoute());
        window.addEventListener('load', () => this.handleRoute());
    }

    addRoute(path, handler) {
        this.routes[path] = handler;
    }

    async handleRoute() {
        const hash = window.location.hash.slice(1) || '/';
        const appEl = document.getElementById('app');
        
        let handler = this.routes[hash];
        
        // Логика префиксов для под-путей (#admin/...)
        if (!handler) {
            const matchingKey = Object.keys(this.routes).find(key => {
                return hash === key || hash.startsWith(key + '/');
            });
            if (matchingKey) {
                handler = this.routes[matchingKey];
            }
        }

        if (handler) {
            try {
                appEl.innerHTML = `
                    <div class="loading-state">
                        <div class="spinner"></div>
                        <p>Загрузка...</p>
                    </div>`;
                const content = await handler();
                appEl.innerHTML = content;
            } catch (error) {
                appEl.innerHTML = `<div class="error-msg">Ошибка загрузки страницы: ${error.message}</div>`;
            }
        } else {
            appEl.innerHTML = `
                <div class="hero">
                    <h2>404</h2>
                    <p>Страница не найдена. Вернитесь на <a href="#/">Главную</a>.</p>
                </div>`;
        }
    }
}

// Инициализация роутера
const router = new Router();
router.addRoute('/', Views.home);
router.addRoute('food', Views.food);
router.addRoute('electronics', Views.electronics);
router.addRoute('alcohol', Views.alcohol);
router.addRoute('philosophy', Views.philosophy);
router.addRoute('authors', Views.authors);
router.addRoute('info', Views.info);
router.addRoute('login', Views.login);
router.addRoute('admin', Views.admin);
