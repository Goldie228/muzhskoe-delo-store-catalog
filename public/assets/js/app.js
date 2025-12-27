
import { api } from './api.js';

/**
 * Утилита для форматирования даты
 */
const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
};

/**
 * Утилита для рендера полей товара
 */
const FieldRenderer = {
  renderArray(key, value) {
    const tags = value.map(v => `<span class="tag">${v}</span>`).join('');
    return `<div class="tags-container">${tags}</div>`;
  },

  renderObject(key, value) {
    if (value.price !== undefined) {
        return `<div class="card-detail-row">
                    <span class="card-detail-label">${value.productName || 'Товар'}</span>
                    <span>${value.quantity} шт x ${value.price} BYN</span>
                </div>`;
    }
    return `<div class="card-detail-row"><span class="card-detail-label">${key}</span>: <span>${JSON.stringify(value)}</span></div>`;
  },

  render(key, value) {
    if (typeof value === 'string' && (value.includes('T') || value.match(/^\d{4}-\d{2}-\d{2}/))) {
        return `<div class="card-detail-row"><span class="card-detail-label">${key}</span>: <span>${formatDate(value)}</span></div>`;
    }
    if (Array.isArray(value)) return this.renderArray(key, value);
    if (typeof value === 'object' && value !== null) return this.renderObject(key, value);
    return `<div class="card-detail-row"><span class="card-detail-label">${key}</span>: <span>${value}</span></div>`;
  }
};

/**
 * Генерация HTML карточки товара
 */
const createCardHTML = (item) => {
  const price = item.price !== undefined ? `${item.price} BYN` : 'Цена не указана';
  const name = item.name || item.title || 'Без названия';

  const excludeKeys = ['id', 'name', 'title', 'price', 'createdAt', 'updatedAt', 'isInStock', 'inStock', 'isAvailable'];
  let detailsHTML = '';

  Object.keys(item).forEach(key => {
    if (!excludeKeys.includes(key)) {
      detailsHTML += FieldRenderer.render(key, item[key]);
    }
  });

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
        ${detailsHTML || '<p style="font-style: italic; color: #9ca3af;">Нет дополнительной информации</p>'}
      </div>
      <div class="card-footer">
        ${stockBadge}
      </div>
    </div>
  `;
};

/**
 * Конфигурация админки
 */
const ADMIN_CONFIG = {
    food: {
        label: 'Еда',
        endpoint: '/food',
        fields: [
            { key: 'name', label: 'Название блюда', type: 'text' },
            { key: 'price', label: 'Цена (BYN)', type: 'number' },
            { key: 'inStock', label: 'В наличии', type: 'checkbox' },
            { key: 'ingredients', label: 'Ингредиенты (через запятую)', type: 'text' }
        ]
    },
    electronics: {
        label: 'Электроника',
        endpoint: '/electronics/goods',
        fields: [
            { key: 'name', label: 'Название товара', type: 'text' },
            { key: 'category', label: 'Категория', type: 'text' },
            { key: 'price', label: 'Цена (BYN)', type: 'number' },
            { key: 'voltage', label: 'Напряжение (В)', type: 'number' },
            { key: 'current', label: 'Ток (А)', type: 'number' },
            { key: 'isInStock', label: 'В наличии', type: 'checkbox' },
            { key: 'specifications', label: 'Характеристики (через запятую)', type: 'text' }
        ]
    },
    alcohol: {
        label: 'Алкоголь',
        endpoint: '/alcohol/beverages',
        fields: [
            { key: 'name', label: 'Название', type: 'text' },
            { key: 'type', label: 'Тип', type: 'text' },
            { key: 'price', label: 'Цена (BYN)', type: 'number' },
            { key: 'strength', label: 'Крепость (%)', type: 'number' },
            { key: 'volume', label: 'Объем (мл)', type: 'number' },
            { key: 'inStock', label: 'В наличии', type: 'checkbox' },
            { key: 'tags', label: 'Теги (через запятую)', type: 'text' }
        ]
    },
    philosophy: {
        label: 'Книги',
        endpoint: '/philosophy/books',
        fields: [
            { key: 'title', label: 'Название книги', type: 'text' },
            { key: 'price', label: 'Цена (BYN)', type: 'number' },
            { key: 'isAvailable', label: 'В наличии', type: 'checkbox' },
            { key: 'publishDate', label: 'Дата публикации', type: 'date' },
            { key: 'tags', label: 'Теги (через запятую)', type: 'text' }
        ]
    }
};

/**
 * Утилита для рендера форм
 */
const AdminForm = {
    open(mode, item, moduleKey) {
        const config = ADMIN_CONFIG[moduleKey];
        const modal = document.getElementById('modal-container');
        
        let fieldsHTML = config.fields.map(field => {
            const value = (mode === 'edit' && item) ? (item[field.key] || '') : '';
            
            if (field.type === 'checkbox') {
                return `
                    <div class="form-group">
                        <label>
                            <input type="checkbox" name="${field.key}" class="form-control" ${value ? 'checked' : ''}>
                            ${field.label}
                        </label>
                    </div>`;
            } else if (Array.isArray(value)) {
                 const strVal = value.join(', ');
                 return `
                    <div class="form-group">
                        <label>${field.label}</label>
                        <input type="${field.type}" name="${field.key}" value="${strVal}" class="form-control">
                    </div>`;
            } else {
                return `
                    <div class="form-group">
                        <label>${field.label}</label>
                        <input type="${field.type}" name="${field.key}" value="${value}" class="form-control">
                    </div>`;
            }
        }).join('');

        modal.innerHTML = `
            <div class="modal-overlay active">
                <div class="modal">
                    <h3>${mode === 'create' ? 'Создать' : 'Редактировать'}: ${config.label}</h3>
                    <form id="admin-form">
                        ${fieldsHTML}
                        <div class="modal-actions">
                            <button type="button" class="btn" style="background:#9ca3af" onclick="AdminForm.close()">Отмена</button>
                            <button type="submit" class="btn">Сохранить</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.getElementById('admin-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            await AdminForm.submit(mode, item, moduleKey);
        });
    },

    close() {
        document.getElementById('modal-container').innerHTML = '';
    },

    async submit(mode, item, moduleKey) {
        const formData = new FormData(document.getElementById('admin-form'));
        const data = {};
        
        ADMIN_CONFIG[moduleKey].fields.forEach(field => {
            if (field.type === 'checkbox') {
                data[field.key] = !!formData.get(field.key);
            } else if (field.key.includes('ingredients') || field.key.includes('tags') || field.key.includes('specifications')) {
                const val = formData.get(field.key);
                data[field.key] = val ? val.split(',').map(s => s.trim()) : [];
            } else {
                data[field.key] = formData.get(field.key);
            }
        });

        try {
            if (mode === 'create') {
                await api.post(ADMIN_CONFIG[moduleKey].endpoint, data);
            } else if (mode === 'edit') {
                await api.put(`${ADMIN_CONFIG[moduleKey].endpoint}/${item.id}`, data);
            }
            AdminForm.close();
            location.hash = '#admin/' + moduleKey;
        } catch (error) {
            alert('Ошибка сохранения: ' + error.message);
        }
    }
};

/**
 * Глобальные функции для обработки событий
 */
window.handleLogin = async (e) => {
    e.preventDefault();
    const form = e.target;
    const login = form.login.value;
    const password = form.password.value;

    try {
        const res = await api.post('/auth/login', { login, password });
        console.log('Ответ сервера при логине:', res);
        if (res.success && res.token) {
            api.setToken(res.token);
            location.hash = '#admin';
        } else {
            alert('Ошибка входа: ' + (res.message || 'Неверный формат ответа'));
        }
    } catch (err) {
        alert('Ошибка соединения или 401: ' + err.message);
    }
};

window.deleteItem = async (moduleKey, id) => {
    if (!confirm('Вы уверены, что хотите удалить запись?')) return;
    try {
        await api.delete(ADMIN_CONFIG[moduleKey].endpoint + '/' + id);
        location.hash = '#admin/' + moduleKey; // Перезагружаем страницу через хеш
    } catch (e) {
        alert('Ошибка удаления: ' + e.message);
    }
};

/**
 * Объект Views (ОБЪЕДИНЕННЫЙ)
 */
const Views = {
    // --- Публичные страницы ---
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

    // --- Админка ---
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
        // Проверка токена
        if (!api.token) {
            location.hash = '#login';
            return '';
        }

        // Иконки для меню
        const ICONS = {
            food: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line></svg>',
            electronics: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line></svg>',
            alcohol: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 21h8a2 2 0 0 0 2-2v-9.4a1 1 0 0 0-.4-.8l-3.6-2.4V4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v2.4l-3.6 2.4a1 1 0 0 0-.4.8V19a2 2 0 0 0 2 2z"></path></svg>',
            philosophy: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>'
        };

        // Если хеш просто '#admin', показываем выбор модулей
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

        // Если хеш вида '#admin/food', показываем таблицу
        const hashParts = location.hash.split('/');
        const currentModule = hashParts[1]; // 'food', 'electronics' ...
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
        
        // 1. Сначала ищем точное совпадение (например, '/', 'food')
        let handler = this.routes[hash];
        
        // 2. Если точного совпадения нет, ищем по префиксу (например, 'admin' для 'admin/electronics')
        if (!handler) {
            const matchingKey = Object.keys(this.routes).find(key => {
                // hash.startsWith(key + '/') — чтобы 'admin' не сработал для 'admins'
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
