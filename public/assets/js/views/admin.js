
import { api } from '../api.js';
import { ICONS } from '../icons.js';
import { ADMIN_CONFIG } from '../config.js';
import { AdminForm } from '../adminLogic.js';
import { deleteItem } from '../adminLogic.js';

export const admin = async () => {
    if (!api.token) {
        location.hash = '#login';
        return '';
    }

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

    const rows = items.map(item => {
        // --- Логика статуса ---
        let statusBadge = '';
        if (item.hasOwnProperty('inStock')) {
            statusBadge = item.inStock ? 'В наличии' : 'Нет';
        } else if (item.hasOwnProperty('isAvailable')) {
             statusBadge = item.isAvailable ? 'В наличии' : 'Нет';
        } else if (item.hasOwnProperty('isInStock')) {
             statusBadge = item.isInStock ? 'В наличии' : 'Нет';
        }

        return `
            <tr>
                <td style="font-family: monospace; color: #64748b;">${item.id}</td>
                <td><strong>${item.name || item.title}</strong></td>
                <td>${statusBadge || '-'}</td>
                <td>${item.price} BYN</td>
                <td>
                    <div style="display: flex; gap: 8px;">
                        <!-- Используем window.openEdit, чтобы избежать JSON.stringify в HTML -->
                        <button class="action-btn btn-edit" 
                                onclick="window.openEdit('${item.id}', '${currentModule}')">
                            Редактировать
                        </button>
                        
                        <button class="action-btn btn-delete" 
                                onclick="deleteItem('${currentModule}', '${item.id}')">
                            Удалить
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

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
                    <div style="display:flex; align-items:center; gap:10px;">
                        <div class="breadcrumb">
                            <span>Главная</span> / <span>Админка</span> / <span style="color: var(--primary-color);">${config.label}</span>
                        </div>
                        <h2 style="margin:0; font-size: 1.5rem; color: var(--text-main);">${config.label}</h2>
                    </div>
                    <button class="btn" style="background: var(--primary-color); margin-left: auto;" onclick="AdminForm.open('create', null, '${currentModule}')">
                        <span style="margin-right: 6px;">+</span> Добавить запись
                    </button>
                </div>
                
                <div class="data-table-wrapper">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th width="100">ID</th>
                                <th>Название / Описание</th>
                                <th width="150">Статус</th>
                                <th width="150">Цена</th>
                                <th width="150">Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rows.length ? rows : '<tr><td colspan="5" style="text-align:center; padding: 3rem; color: #94a3b8;">Данные не найдены</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
};
