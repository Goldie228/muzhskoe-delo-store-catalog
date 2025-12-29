
import { api } from '../api.js';
import { createCardHTML } from '../components.js';
import { ICONS } from '../icons.js';

export const food = async () => {
    const res = await api.get('/food');
    const items = res.data || [];
    const cards = items.map(item => createCardHTML(item)).join('');
    return `
        <div style="margin-bottom: 1.5rem;"><h1 style="margin:0;">Меню блюд</h1><p style="margin:0.5rem 0 0; color:#666;">Свежая еда, доставляемая к вашей двери.</p></div>
        ${cards ? `<div class="items-grid">${cards}</div>` : '<p>Блюд пока нет.</p>'}
    `;
};

export const electronics = async () => {
    const res = await api.get('/electronics/goods');
    const items = res.data || [];
    const cards = items.map(item => createCardHTML(item)).join('');
    return `
        <div style="margin-bottom: 1.5rem;"><h1 style="margin:0;">Электроника</h1><p style="margin:0.5rem 0 0; color:#666;">Качественная техника для дома и работы.</p></div>
        ${cards ? `<div class="items-grid">${cards}</div>` : '<p>Товаров пока нет.</p>'}
    `;
};

export const alcohol = async () => {
    const res = await api.get('/alcohol/beverages');
    const items = res.data || [];
    const cards = items.map(item => createCardHTML(item)).join('');
    return `
        <div style="margin-bottom: 1.5rem;"><h1 style="margin:0;">Алкоголь</h1><p style="margin:0.5rem 0 0; color:#666;">Премиальные напитки для особых случаев.</p></div>
        ${cards ? `<div class="items-grid">${cards}</div>` : '<p>Напитков пока нет.</p>'}
    `;
};

export const philosophy = async () => {
    const res = await api.get('/philosophy/books');
    const items = res.data || [];
    const cards = items.map(item => createCardHTML(item)).join('');
    return `
        <div style="margin-bottom: 1.5rem;"><h1 style="margin:0;">Философия</h1><p style="margin:0.5rem 0 0; color:#666;">Книги для развития ума и духа.</p></div>
        ${cards ? `<div class="items-grid">${cards}</div>` : '<p>Книг пока нет.</p>'}
    `;
};
