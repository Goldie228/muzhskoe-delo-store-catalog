
import { api } from './api.js';
import { createCardHTML } from './components.js';
import { ADMIN_CONFIG } from './config.js';
import { AdminForm } from './adminLogic.js';
import { deleteItem } from './adminLogic.js';
import { ICONS } from './icons.js';

export const Views = {
    // --- ГЛАВНАЯ ---
    home: () => `
        <div class="hero">
            <h2>Мужское Дело</h2>
            <p>Всё необходимое для современного мужчины: от инструментов до книг, от техники до элитного алкоголя.</p>
            <div class="items-grid">
                <div class="card" style="cursor: pointer; text-align:center; padding: 2rem;" onclick="window.location.hash='#food'">
                    ${ICONS.foodLarge}
                    <h3 style="margin-top:0;">Еда</h3>
                </div>
                <div class="card" style="cursor: pointer; text-align:center; padding: 2rem;" onclick="window.location.hash='#electronics'">
                    ${ICONS.electronicsLarge}
                    <h3 style="margin-top:0;">Электроника</h3>
                </div>
                <div class="card" style="cursor: pointer; text-align:center; padding: 2rem;" onclick="window.location.hash='#alcohol'">
                    ${ICONS.alcoholLarge}
                    <h3 style="margin-top:0;">Напитки</h3>
                </div>
                <div class="card" style="cursor: pointer; text-align:center; padding: 2rem;" onclick="window.location.hash='#philosophy'">
                    ${ICONS.philosophyLarge}
                    <h3 style="margin-top:0;">Книги</h3>
                </div>
            </div>
        </div>
    `,

    // --- СТРАНИЦЫ КАТЕГОРИЙ ---
    food: async () => {
        const res = await api.get('/food');
        const items = res.data || [];
        const cards = items.map(item => createCardHTML(item)).join('');
        return `
            <div style="margin-bottom: 1.5rem;"><h1 style="margin:0;">Меню блюд</h1><p style="margin:0.5rem 0 0; color:#666;">Свежая еда, доставляемая к вашей двери.</p></div>
            ${cards ? `<div class="items-grid">${cards}</div>` : '<p>Блюд пока нет.</p>'}
        `;
    },

    electronics: async () => {
        const res = await api.get('/electronics/goods');
        const items = res.data || [];
        const cards = items.map(item => createCardHTML(item)).join('');
        return `
            <div style="margin-bottom: 1.5rem;"><h1 style="margin:0;">Электроника</h1><p style="margin:0.5rem 0 0; color:#666;">Качественная техника для дома и работы.</p></div>
            ${cards ? `<div class="items-grid">${cards}</div>` : '<p>Товаров пока нет.</p>'}
        `;
    },

    alcohol: async () => {
        const res = await api.get('/alcohol/beverages');
        const items = res.data || [];
        const cards = items.map(item => createCardHTML(item)).join('');
        return `
            <div style="margin-bottom: 1.5rem;"><h1 style="margin:0;">Алкоголь</h1><p style="margin:0.5rem 0 0; color:#666;">Премиальные напитки для особых случаев.</p></div>
            ${cards ? `<div class="items-grid">${cards}</div>` : '<p>Напитков пока нет.</p>'}
        `;
    },

    philosophy: async () => {
        const res = await api.get('/philosophy/books');
        const items = res.data || [];
        const cards = items.map(item => createCardHTML(item)).join('');
        return `
            <div style="margin-bottom: 1.5rem;"><h1 style="margin:0;">Философия</h1><p style="margin:0.5rem 0 0; color:#666;">Книги для развития ума и духа.</p></div>
            ${cards ? `<div class="items-grid">${cards}</div>` : '<p>Книг пока нет.</p>'}
        `;
    },

    // --- ИНФОРМАЦИОННЫЕ СТРАНИЦЫ ---
    authors: () => {
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

    info: () => {
        return `
            <div class="info-section">
                <h1>📦 Каталог магазина "Мужское дело"</h1>
                <p>Проект, разработанный в рамках лабораторных работ №9-10 по курсу "Веб-программирование".</p>
                
                <h2>📖 Описание проекта</h2>
                <p>Проект <strong>"Мужское дело"</strong> — это серверное веб-приложение, представляющее собой каталог товаров для одноименного гипотетического магазина.</p>
                <ul>
                    <li>🍔 Доставка еды (вариант №8)</li>
                    <li>📱 Электроника (вариант №21)</li>
                    <li>🍷 Алкогольная продукция (вариант №24)</li>
                    <li>📚 Книги по философии (вариант №17)</li>
                </ul>

                <h2>⚙️ Реализация</h2>
                <ul>
                    <li><strong>Без фреймворков:</strong> Собственный Node.js фреймворк (без Express/Koa).</li>
                    <li><strong>Архитектура:</strong> RESTful API, EventEmmiter, Streams.</li>
                </ul>
            </div>
        `;
    },

    // --- ЛОГИН ---
    login: () => `
        <div class="login-container">
            <div class="login-card">
                ${ICONS.user}
                <h2>Вход для Администратора</h2>
                <form onsubmit="window.handleLogin(event)">
                    <div class="form-group">
                        <label>Логин</label>
                        <input type="text" name="login" class="form-control" required placeholder="admin">
                    </div>
                    <div class="form-group">
                        <label>Пароль</label>
                        <input type="password" name="password" class="form-control" required placeholder="admin">
                    </div>
                    <button type="submit" class="btn" style="width:100%; margin-top:1rem;">Войти</button>
                </form>
            </div>
        </div>
    `,

    // --- АДМИНКА ---
    admin: async () => {
        // Проверка токена
        if (!api.token) {
            location.hash = '#login';
            return '';
        }

        // Экран выбора модуля
        if (location.hash === '#admin') {
            const keys = Object.keys(ADMIN_CONFIG);
            const menuItems = keys.map(k => `
                <div class="card" style="padding:2rem; text-align:center; cursor:pointer; border:1px solid #e5e7eb; transition:all 0.2s;" onclick="window.location.hash='#admin/${k}'">
                    <div style="display:block; margin:0 auto 1rem; color: var(--accent-color);">
                        ${ICONS[k] || ''}
                    </div>
                    <h3 style="margin-top:0;">${ADMIN_CONFIG[k].label}</h3>
                </div>
            `).join('');

            return `
                <div style="text-align:center; padding-bottom: 2rem;">
                    <h1 style="font-size: 1.75rem; color: var(--primary-color);">Панель Администратора</h1>
                    <p style="color: var(--text-muted);">Выберите модуль для управления</p>
                </div>
                <div class="items-grid" style="max-width: 900px; margin: 0 auto;">
                    ${menuItems}
                    <div class="card" style="padding:2rem; text-align:center; cursor:pointer; background:#fee2e2; border:1px solid #fecaca;" onclick="location.hash='#/'">
                        <h3 style="margin:0; color: #991b1b;">Выход на сайт</h3>
                    </div>
                </div>
            `;
        }

        const hashParts = location.hash.split('/');
        const currentModule = hashParts[1];
        const config = ADMIN_CONFIG[currentModule];

        if (!config) return '<div style="text-align:center; padding:2rem; color:var(--text-muted);">Модуль не найден</div>';

        const res = await api.get(config.endpoint);
        const items = res.data || [];

        const rows = items.map(item => `
            <tr>
                <td style="font-family: monospace; color: #64748b;">${item.id}</td>
                <td><strong>${item.name || item.title}</strong></td>
                <td>${item.price} BYN</td>
                <td>
                    <div style="display: flex; gap: 8px;">
                        <button class="action-btn btn-edit" onclick="AdminForm.open('edit', ${JSON.stringify(item)}, '${currentModule}')">Редактировать</button>
                        <button class="action-btn btn-delete" onclick="deleteItem('${currentModule}', '${item.id}')">Удалить</button>
                    </div>
                </td>
            </tr>
        `).join('');

        return `
            <div class="admin-layout">
                <div class="admin-sidebar">
                    <div class="admin-menu-header">
                        ${ICONS.lock}
                        <span>Админка</span>
                    </div>
                    
                    <div class="admin-menu-btn" onclick="location.hash='#admin'">
                        ${ICONS.grid}
                        <span>Обзор</span>
                    </div>
                    
                    ${Object.keys(ADMIN_CONFIG).map(k => `
                        <div class="admin-menu-btn ${k === currentModule ? 'active' : ''}" onclick="window.location.hash='#admin/${k}'">
                            ${ICONS[k] || ''}
                            <span>${ADMIN_CONFIG[k].label}</span>
                        </div>
                    `).join('')}

                    <div class="admin-menu-btn logout" onclick="localStorage.removeItem('auth_token'); api.setToken(null); location.hash='#login'">
                        ${ICONS.logout}
                        <span>Выйти</span>
                    </div>
                </div>
                <div class="admin-content">
                    <div class="admin-header">
                        <div class="breadcrumb">
                            <span>Главная</span> / <span>Админка</span> / <span style="color: var(--primary-color);">${config.label}</span>
                        </div>
                        <h2 style="margin:0; font-size: 1.5rem; color: var(--text-main);">${config.label}</h2>
                        <button class="btn" style="background: var(--primary-color);" onclick="AdminForm.open('create', null, '${currentModule}')">
                            <span style="margin-right: 6px;">+</span> Добавить запись
                        </button>
                    </div>
                    
                    <div class="data-table-wrapper">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th width="100">ID</th>
                                    <th>Название / Описание</th>
                                    <th width="120">Цена</th>
                                    <th width="150">Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${rows.length ? rows : '<tr><td colspan="4" style="text-align:center; padding: 3rem; color: #94a3b8;">Данные не найдены</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }
};
