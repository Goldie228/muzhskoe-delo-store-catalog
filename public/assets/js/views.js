
import { api } from './api.js';
import { createCardHTML } from './components.js';
import { ADMIN_CONFIG } from './config.js';
import { AdminForm } from './adminLogic.js';
import { deleteItem } from './adminLogic.js';

const ICONS = {
    food: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line></svg>',
    electronics: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line></svg>',
    alcohol: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 21h8a2 2 0 0 0 2-2v-9.4a1 1 0 0 0-.4-.8l-3.6-2.4V4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v2.4l-3.6 2.4a1 1 0 0 0-.4.8V19a2 2 0 0 0 2 2z"></path></svg>',
    philosophy: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>'
};

export const Views = {
    home: () => `
        <div class="hero">
            <h2>Мужское Дело</h2>
            <p>Всё необходимое для современного мужчины: от инструментов до книг, от техники до элитного алкоголя.</p>
            <div class="items-grid">
                <div class="card" style="cursor: pointer; text-align:center; padding: 2rem;" onclick="window.location.hash='#food'">
                    <svg style="display:block; margin:0 auto 1rem;" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>
                    <h3 style="margin-top:0;">Еда</h3>
                </div>
                <div class="card" style="cursor: pointer; text-align:center; padding: 2rem;" onclick="window.location.hash='#electronics'">
                    <svg style="display:block; margin:0 auto 1rem;" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg>
                    <h3 style="margin-top:0;">Электроника</h3>
                </div>
                <div class="card" style="cursor: pointer; text-align:center; padding: 2rem;" onclick="window.location.hash='#alcohol'">
                    <svg style="display:block; margin:0 auto 1rem;" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2"><path d="M8 21h8a2 2 0 0 0 2-2v-9.4a1 1 0 0 0-.4-.8l-3.6-2.4V4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v2.4l-3.6 2.4a1 1 0 0 0-.4.8V19a2 2 0 0 0 2 2z"></path></svg>
                    <h3 style="margin-top:0;">Напитки</h3>
                </div>
                <div class="card" style="cursor: pointer; text-align:center; padding: 2rem;" onclick="window.location.hash='#philosophy'">
                    <svg style="display:block; margin:0 auto 1rem;" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                    <h3 style="margin-top:0;">Книги</h3>
                </div>
            </div>
        </div>
    `,

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

    login: () => `
        <div class="login-container">
            <div class="login-card">
                <svg style="display:block; margin:0 auto 1.5rem; color: var(--accent-color);" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
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

    admin: async () => {
        if (!api.token) {
            location.hash = '#login';
            return '';
        }

        if (location.hash === '#admin') {
            const keys = Object.keys(ADMIN_CONFIG);
            const menuItems = keys.map(k => `
                <div class="card" style="padding:2rem; text-align:center; cursor:pointer;" onclick="window.location.hash='#admin/${k}'">
                    <div style="display:block; margin:0 auto 1rem; color: var(--accent-color);">${ICONS[k] || ''}</div>
                    <h3 style="margin-top:0;">${ADMIN_CONFIG[k].label}</h3>
                </div>
            `).join('');

            return `
                <h1 style="text-align:center;">Панель Администратора</h1>
                <div class="items-grid" style="max-width:800px; margin:0 auto;">
                    ${menuItems}
                    <div class="card" style="padding:2rem; text-align:center; cursor:pointer; background:#fee2e2;" onclick="location.hash='#/'">
                        <h3 style="margin-top:0;">Выход</h3>
                    </div>
                </div>
            `;
        }

        const hashParts = location.hash.split('/');
        const currentModule = hashParts[1];
        const config = ADMIN_CONFIG[currentModule];

        if (!config) return 'Модуль не найден';

        const res = await api.get(config.endpoint);
        const items = res.data || [];

        const rows = items.map(item => `
            <tr>
                <td style="font-family: monospace;">${item.id}</td>
                <td><strong>${item.name || item.title}</strong></td>
                <td>${item.price} BYN</td>
                <td>
                    <button class="action-btn btn-edit" onclick="AdminForm.open('edit', ${JSON.stringify(item)}, '${currentModule}')">Ред.</button>
                    <button class="action-btn btn-delete" onclick="deleteItem('${currentModule}', '${item.id}')">Удалить</button>
                </td>
            </tr>
        `).join('');

        return `
            <div class="admin-layout">
                <div class="admin-sidebar">
                    <div class="admin-menu-header">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                        <span>Админка</span>
                    </div>
                    
                    <div class="admin-menu-btn" onclick="location.hash='#admin'">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><polyline points="8 6 12 2 16 6"></polyline></svg>
                        <span>Меню</span>
                    </div>
                    
                    ${Object.keys(ADMIN_CONFIG).map(k => `
                        <div class="admin-menu-btn ${k === currentModule ? 'active' : ''}" onclick="window.location.hash='#admin/${k}'">
                            ${ICONS[k] || ''}
                            <span>${ADMIN_CONFIG[k].label}</span>
                        </div>
                    `).join('')}

                    <div class="admin-menu-btn logout" onclick="localStorage.removeItem('auth_token'); api.setToken(null); location.hash='#login'">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 20 21 8 3"></polyline><line x1="12" y1="1" x2="12" y2="23"></line></svg>
                        <span>Выйти</span>
                    </div>
                </div>
                <div class="admin-content">
                    <div class="breadcrumb">
                        <span>Главная</span> / <span>Админка</span> / <span>${config.label}</span>
                    </div>
                    <div class="admin-header">
                        <h2 style="margin:0;">Управление: ${config.label}</h2>
                        <button class="btn btn-add" onclick="AdminForm.open('create', null, '${currentModule}')">+ Добавить</button>
                    </div>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Название</th>
                                <th>Цена</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rows.length ? rows : '<tr><td colspan="4" style="text-align:center; padding:2rem;">Данных нет</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }
};
