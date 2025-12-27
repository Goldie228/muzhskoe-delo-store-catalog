
import { api } from './api.js';

/**
 * Утилита для рендера полей товара.
 * Проверяет тип поля и красиво выводит его.
 */
const FieldRenderer = {
  renderArray(key, value) {
    const tags = value.map(v => `<span class="tag">${v}</span>`).join('');
    return `<div class="tags-container">${tags}</div>`;
  },

  renderObject(key, value) {
    // Если это объект с ценой и кол-вом (в заказах)
    if (value.price !== undefined) {
        return `<div class="card-detail-row">
                    <span class="card-detail-label">${value.productName || 'Товар'}</span>
                    <span>${value.quantity} шт x ${value.price} ₽</span>
                </div>`;
    }
    return `<div class="card-detail-row"><span class="card-detail-label">${key}</span>: <span>${JSON.stringify(value)}</span></div>`;
  },

  render(key, value) {
    if (Array.isArray(value)) return this.renderArray(key, value);
    if (typeof value === 'object' && value !== null) return this.renderObject(key, value);
    return `<div class="card-detail-row"><span class="card-detail-label">${key}</span>: <span>${value}</span></div>`;
  }
};

/**
 * Генерация HTML карточки товара
 */
const createCardHTML = (item, categoryName) => {
  // Форматирование цены
  const price = item.price !== undefined ? `${item.price} ₽` : 'Цена не указана';
  const name = item.name || item.title || 'Без названия';

  // Собираем детали (пропуская стандартные поля)
  const excludeKeys = ['id', 'name', 'title', 'price', 'createdAt', 'updatedAt', 'isInStock', 'inStock', 'isAvailable'];
  let detailsHTML = '';

  Object.keys(item).forEach(key => {
    if (!excludeKeys.includes(key)) {
      detailsHTML += FieldRenderer.render(key, item[key]);
    }
  });

  // Логика наличия (разные поля в разных сервисах)
  let stockBadge = '';
  if (item.inStock !== undefined || item.isInStock !== undefined || item.isAvailable !== undefined) {
    const isStock = item.inStock ?? item.isInStock ?? item.isAvailable;
    stockBadge = isStock 
      ? `<span class="badge in-stock">✅ В наличии</span>` 
      : `<span class="badge out-of-stock">❌ Нет в наличии</span>`;
  }

  return `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">${name}</h3>
        <span class="card-price">${price}</span>
      </div>
      <div class="card-body">
        ${detailsHTML || '<p style="font-style: italic;">Нет дополнительной информации</p>'}
      </div>
      <div class="card-footer">
        ${stockBadge}
        <button class="btn" disabled>В корзину</button>
      </div>
    </div>
  `;
};

/**
 * Роутер и Views
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

const Views = {
    // --- Главная ---
    home: () => `
        <div class="hero">
            <h2>Мужское Дело</h2>
            <p>Всё необходимое для современного мужчины: от инструментов до книг, от техники до элитного алкоголя.</p>
            <div class="items-grid">
                <div class="card" style="cursor: pointer; text-align:center; padding: 2rem;" onclick="window.location.hash='#food'">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path></svg>
                    <h3 style="margin-top:1rem;">Еда</h3>
                </div>
                <div class="card" style="cursor: pointer; text-align:center; padding: 2rem;" onclick="window.location.hash='#electronics'">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect></svg>
                    <h3 style="margin-top:1rem;">Электроника</h3>
                </div>
                <div class="card" style="cursor: pointer; text-align:center; padding: 2rem;" onclick="window.location.hash='#alcohol'">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2"><path d="M8 21h8a2 2 0 0 0 2-2v-9.4a1 1 0 0 0-.4-.8l-3.6-2.4V4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v2.4l-3.6 2.4a1 1 0 0 0-.4.8V19a2 2 0 0 0 2 2z"></path></svg>
                    <h3 style="margin-top:1rem;">Напитки</h3>
                </div>
                <div class="card" style="cursor: pointer; text-align:center; padding: 2rem;" onclick="window.location.hash='#philosophy'">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                    <h3 style="margin-top:1rem;">Книги</h3>
                </div>
            </div>
        </div>
    `,

    // --- Еда ---
    food: async () => {
        const res = await api.get('/food');
        const items = res.data || [];
        const cards = items.map(item => createCardHTML(item)).join('');
        return `
            <div style="margin-bottom: 1.5rem;"><h1 style="margin:0;">Меню блюд</h1><p style="margin:0.5rem 0 0; color:#666;">Свежая еда, доставляемая к вашей двери.</p></div>
            ${cards ? `<div class="items-grid">${cards}</div>` : '<p>Блюд пока нет.</p>'}
        `;
    },

    // --- Электроника ---
    electronics: async () => {
        const res = await api.get('/electronics/goods');
        const items = res.data || [];
        const cards = items.map(item => createCardHTML(item)).join('');
        return `
            <div style="margin-bottom: 1.5rem;"><h1 style="margin:0;">Электроника</h1><p style="margin:0.5rem 0 0; color:#666;">Качественная техника для дома и работы.</p></div>
            ${cards ? `<div class="items-grid">${cards}</div>` : '<p>Товаров пока нет.</p>'}
        `;
    },

    // --- Алкоголь ---
    alcohol: async () => {
        const res = await api.get('/alcohol/beverages');
        const items = res.data || [];
        const cards = items.map(item => createCardHTML(item)).join('');
        return `
            <div style="margin-bottom: 1.5rem;"><h1 style="margin:0;">Алкоголь</h1><p style="margin:0.5rem 0 0; color:#666;">Премиальные напитки для особых случаев.</p></div>
            ${cards ? `<div class="items-grid">${cards}</div>` : '<p>Напитков пока нет.</p>'}
        `;
    },

    // --- Философия ---
    philosophy: async () => {
        const res = await api.get('/philosophy/books');
        const items = res.data || [];
        const cards = items.map(item => createCardHTML(item)).join('');
        return `
            <div style="margin-bottom: 1.5rem;"><h1 style="margin:0;">Философия</h1><p style="margin:0.5rem 0 0; color:#666;">Книги для развития ума и духа.</p></div>
            ${cards ? `<div class="items-grid">${cards}</div>` : '<p>Книг пока нет.</p>'}
        `;
    },

    // --- Авторы ---
    authors: () => {
        // Статические данные из Markdown
        const authors = [
            { name: 'Кажуро Глеб', role: 'ТимЛид, Разработка API (Еда)', variant: '№8' },
            { name: 'Пугач Никита', role: 'Разработка API (Философия)', variant: '№17' },
            { name: 'Султанов Тимофей', role: 'Разработка API (Электроника)', variant: '№21' },
            { name: 'Тимовец Никита', role: 'Разработка API (Алкоголь)', variant: '№24' }
        ];

        const rows = authors.map(a => `
            <tr>
                <td>${a.name}</td>
                <td>${a.role}</td>
                <td><span class="tag">${a.variant}</span></td>
            </tr>
        `).join('');

        return `
            <div class="info-section">
                <h1>Команда разработчиков</h1>
                <p style="color:#666;">Группа Т-393 / Т-392 • Веб-программирование • Лабораторные №9-10</p>
                
                <table class="team-table">
                    <thead>
                        <tr>
                            <th>Имя</th>
                            <th>Роль в проекте</th>
                            <th>Вариант ТЗ</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            </div>
        `;
    },

    // --- Инфо (Проект) ---
    info: () => {
        return `
            <div class="info-section">
                <h1>📦 Каталог магазина "Мужское дело"</h1>
                <p>Проект, разработанный в рамках лабораторных работ №9-10 по курсу "Веб-программирование".</p>
                
                <h2>📖 Описание проекта</h2>
                <p>Проект <strong>"Мужское дело"</strong> — это серверное веб-приложение, представляющее собой каталог товаров для одноименного гипотетического магазина. Уникальность проекта заключается в его концепции: он объединяет четыре разные тематики в единую структуру.</p>
                <ul>
                    <li>🍔 Доставка еды (вариант №8)</li>
                    <li>📱 Электроника (вариант №21)</li>
                    <li>🍷 Алкогольная продукция (вариант №24)</li>
                    <li>📚 Книги по философии (вариант №17)</li>
                </ul>

                <h2>🚀 Техническое задание и Реализация</h2>
                <p>В основе проекта лежит самописный фреймворк, разработанный в соответствии со строгими требованиями лабораторной работы.</p>
                <ul>
                    <li><strong>Без фреймворков:</strong> Запрещено использование Express, Koa. Вся логика на Node.js.</li>
                    <li><strong>Архитектура:</strong> RESTful API, EventEmmiter, Streams.</li>
                </ul>

                <h2>🌐 API</h2>
                <p>Сервер предоставляет JSON API по адресам вида <code>/api/&lt;module&gt;</code>.</p>

                <h2>📄 Лицензия</h2>
                <p>Этот проект лицензирован под лицензией MIT.</p>
            </div>
        `;
    }
};

// Инициализация
const router = new Router();
router.addRoute('/', Views.home);
router.addRoute('food', Views.food);
router.addRoute('electronics', Views.electronics);
router.addRoute('alcohol', Views.alcohol);
router.addRoute('philosophy', Views.philosophy);
router.addRoute('authors', Views.authors);
router.addRoute('info', Views.info);
