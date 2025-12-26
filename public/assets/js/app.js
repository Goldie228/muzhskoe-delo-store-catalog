
import { api } from './api.js';

/**
 * Простая реализация роутинга для SPA
 * Отслеживает хеш в URL (#food, #electronics и т.д.)
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
        const handler = this.routes[hash];
        const appEl = document.getElementById('app');

        if (handler) {
            try {
                appEl.innerHTML = '<div class="loading">Загрузка...</div>';
                const content = await handler();
                appEl.innerHTML = content;
            } catch (error) {
                appEl.innerHTML = `<div class="error-msg">Ошибка загрузки: ${error.message}</div>`;
            }
        } else {
            appEl.innerHTML = '<div class="error-msg">Страница не найдена (404)</div>';
        }
    }
}

/**
 * Компоненты отображения (Views)
 */
const Views = {
    home: () => `
        <div class="hero">
            <h2>Добро пожаловать в "Мужское дело"</h2>
            <p>У нас есть всё, что нужно современному мужчине: еда, техника, напитки и мудрость.</p>
            <div class="items-grid">
                <div class="card">
                    <h3>🍔 Доставка еды</h3>
                    <p>Вкусные блюда на любой вкус.</p>
                    <a href="#food" class="btn">Перейти</a>
                </div>
                <div class="card">
                    <h3>📱 Электроника</h3>
                    <p>Гаджеты и техника для дома и работы.</p>
                    <a href="#electronics" class="btn">Перейти</a>
                </div>
                <div class="card">
                    <h3>🍷 Алкоголь</h3>
                    <p>Премиальные напитки для особых случаев.</p>
                    <a href="#alcohol" class="btn">Перейти</a>
                </div>
                <div class="card">
                    <h3>📚 Философия</h3>
                    <p>Книги для развития ума и духа.</p>
                    <a href="#philosophy" class="btn">Перейти</a>
                </div>
            </div>
        </div>
    `,

    food: async () => {
        const data = await api.get('/food');
        const items = data.data || [];
        
        let itemsHtml = items.map(item => `
            <div class="card">
                <h3>${item.name}</h3>
                <div class="card-price">${item.price} ₽</div>
                <p>${item.ingredients ? 'Ингредиенты: ' + item.ingredients.join(', ') : ''}</p>
                <p>${item.inStock ? '✅ В наличии' : '❌ Нет в наличии'}</p>
                <button class="btn" disabled>Заказать</button>
            </div>
        `).join('');

        return `
            <h2>Меню блюд</h2>
            ${items.length ? `<div class="items-grid">${itemsHtml}</div>` : '<p>Блюд пока нет.</p>'}
        `;
    },

    electronics: async () => {
        const data = await api.get('/electronics/goods');
        const items = data.data || [];

        let itemsHtml = items.map(item => `
            <div class="card">
                <h3>${item.name}</h3>
                <div class="card-price">${item.price} ₽</div>
                <p>Категория: ${item.category}</p>
                <p>Напряжение: ${item.voltage}В</p>
                <p>${item.isInStock ? '✅ В наличии' : '❌ Нет в наличии'}</p>
                <button class="btn" disabled>Купить</button>
            </div>
        `).join('');

        return `
            <h2>Электроника</h2>
            ${items.length ? `<div class="items-grid">${itemsHtml}</div>` : '<p>Товаров пока нет.</p>'}
        `;
    },

    alcohol: async () => {
        const data = await api.get('/alcohol/beverages');
        const items = data.data || [];

        let itemsHtml = items.map(item => `
            <div class="card">
                <h3>${item.name}</h3>
                <div class="card-price">${item.price} ₽</div>
                <p>Тип: ${item.type}</p>
                <p>Крепость: ${item.strength}%</p>
                <p>Объем: ${item.volume}мл</p>
                <button class="btn" disabled>В корзину</button>
            </div>
        `).join('');

        return `
            <h2>Алкогольная продукция</h2>
            ${items.length ? `<div class="items-grid">${itemsHtml}</div>` : '<p>Напитков пока нет.</p>'}
        `;
    },

    philosophy: async () => {
        const data = await api.get('/philosophy/books');
        const items = data.data || [];

        let itemsHtml = items.map(item => `
            <div class="card">
                <h3>${item.title}</h3>
                <div class="card-price">${item.price} ₽</div>
                <p>Дата публикации: ${new Date(item.publishDate).toLocaleDateString()}</p>
                <p>${item.tags ? 'Теги: ' + item.tags.join(', ') : ''}</p>
                <button class="btn" disabled>Читать</button>
            </div>
        `).join('');

        return `
            <h2>Книги по философии</h2>
            ${items.length ? `<div class="items-grid">${itemsHtml}</div>` : '<p>Книг пока нет.</p>'}
        `;
    }
};

// Инициализация роутера
const router = new Router();
router.addRoute('/', Views.home);
router.addRoute('food', Views.food);
router.addRoute('electronics', Views.electronics);
router.addRoute('alcohol', Views.alcohol);
router.addRoute('philosophy', Views.philosophy);
