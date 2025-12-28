
import { api } from './api.js';
import { Views } from './views.js';
import { ICONS } from './icons.js';

// --- ИНЪЕКЦИЯ ИКОНОК ---
// Заменяет <span data-icon="name"> на <svg>...</svg>
function injectIcons() {
    document.querySelectorAll('[data-icon]').forEach(el => {
        const iconName = el.getAttribute('data-icon');
        if (ICONS[iconName]) {
            el.innerHTML = ICONS[iconName];
            el.classList.add('svg-icon'); // Добавляем базовый класс для CSS
        } else {
            console.error(`Иконка "${iconName}" не найдена в объекте ICONS`);
        }
    });
}

// Запускаем инъекцию после полной загрузки HTML
document.addEventListener('DOMContentLoaded', injectIcons);

// --- КЛАСС РОУТЕРА ---
// Управляет навигацией и рендерингом страниц
class Router {
    constructor() {
        this.routes = {};
        // Слушаем изменения хеша в адресной строке
        window.addEventListener('hashchange', () => this.handleRoute());
        window.addEventListener('load', () => this.handleRoute());
    }

    // Регистрация маршрута
    addRoute(path, handler) {
        this.routes[path] = handler;
    }

    // Основной метод обработки маршрута
    async handleRoute() {
        const hash = window.location.hash.slice(1) || '/';
        const appEl = document.getElementById('app');

        if (!appEl) return;

        // Поиск обработчика. Сначала ищем точное совпадение.
        let handler = this.routes[hash];
        
        // Если точного совпадения нет, ищем по префиксу (нужно для админки: #admin/food)
        if (!handler) {
            const matchingKey = Object.keys(this.routes).find(key => {
                return hash.startsWith(key + '/');
            });
            if (matchingKey) {
                handler = this.routes[matchingKey];
            }
        }

        if (handler) {
            // 1. Показываем спиннер загрузки
            appEl.innerHTML = `
                <div class="loading-state">
                    <div class="spinner"></div>
                    <p>Загрузка...</p>
                </div>`;

            // 2. Проверка авторизации для админки
            if (hash.startsWith('#admin') && !api.token) {
                location.hash = '#login';
                return;
            }

            // 3. Выполняем рендер
            try {
                const content = await handler();
                appEl.innerHTML = content;
            } catch (error) {
                console.error('Ошибка при загрузке страницы:', error);
                appEl.innerHTML = `
                    <div class="error-msg">
                        <h3>Произошла ошибка</h3>
                        <p>${error.message}</p>
                    </div>`;
            }
        } else {
            // Если страница не найдена (404), рендерим главную
            try {
                appEl.innerHTML = await Views.home();
            } catch (error) {
                console.error('Ошибка при рендере главной:', error);
            }
        }
    }
}

// --- ИНИЦИАЛИЗАЦИЯ ---
const router = new Router();

// Регистрация маршрутов
router.addRoute('/', Views.home);
router.addRoute('food', Views.food);
router.addRoute('electronics', Views.electronics);
router.addRoute('alcohol', Views.alcohol);
router.addRoute('philosophy', Views.philosophy);
router.addRoute('authors', Views.authors);
router.addRoute('info', Views.info);
router.addRoute('login', Views.login);
router.addRoute('admin', Views.admin); // Админка сама обрабатывает под-пути (#admin/...)
