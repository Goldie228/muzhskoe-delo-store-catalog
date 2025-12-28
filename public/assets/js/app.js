
import { api } from './api.js';
import { Views } from './views/index.js';
import { ICONS } from './icons.js';

// --- ИНЪЕКЦИЯ ИКОНОК ---
function injectIcons() {
    document.querySelectorAll('[data-icon]').forEach(el => {
        const iconName = el.getAttribute('data-icon');
        if (ICONS[iconName]) {
            el.innerHTML = ICONS[iconName];
            el.classList.add('svg-icon');
        } else {
            console.error(`Иконка "${iconName}" не найдена`);
        }
    });
}

// Запуск инъекции при загрузке
document.addEventListener('DOMContentLoaded', injectIcons);

// --- КЛАСС РОУТЕРА ---
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

        if (!appEl) return;

        // 1. Спиннер
        appEl.innerHTML = `
            <div class="loading-state">
                <div class="spinner"></div>
                <p>Загрузка...</p>
            </div>`;

        // 2. Проверка авторизации (можно вынести в отдельный Guard middleware)
        if (hash.startsWith('admin') && !api.token) {
            location.hash = '#login';
            return;
        }

        // 3. Поиск хэндлера
        let handler = this.routes[hash];
        if (!handler) {
            const matchingKey = Object.keys(this.routes).find(key => hash.startsWith(key + '/'));
            if (matchingKey) {
                handler = this.routes[matchingKey];
            }
        }

        if (handler) {
            try {
                const content = await handler();
                appEl.innerHTML = content;
                // Важно: запускаем инъекцию иконок для нового контента!
                injectIcons();
            } catch (error) {
                console.error('Ошибка роутера:', error);
                appEl.innerHTML = `<div class="error-msg">Ошибка: ${error.message}</div>`;
            }
        } else {
            // 404 -> на главную
            try {
                appEl.innerHTML = await Views.home();
                injectIcons();
            } catch (e) {}
        }
    }
}

// Инициализация и экспорт роутера
const router = new Router();
window.router = router; // Делаем глобальным для использования в adminLogic.js

// Регистрация маршрутов
router.addRoute('/', Views.home);
router.addRoute('food', Views.food);
router.addRoute('electronics', Views.electronics);
router.addRoute('alcohol', Views.alcohol);
router.addRoute('philosophy', Views.philosophy);
router.addRoute('authors', Views.authors);
router.addRoute('info', Views.info);
router.addRoute('login', Views.login);
router.addRoute('admin', Views.admin);
