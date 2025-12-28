
import { ICONS } from './icons.js';

/**
 * Утилита для форматирования даты
 */
export const formatDate = (dateString) => {
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
    return `<div class="card-detail-row"><span class="card-detail-label">${key}</span><span>${JSON.stringify(value)}</span></div>`;
  },

  render(key, value) {
    if (typeof value === 'string' && (value.includes('T') || value.match(/^\d{4}-\d{2}-\d{2}/))) {
        return `<div class="card-detail-row"><span class="card-detail-label">${key}</span><span>${formatDate(value)}</span></div>`;
    }
    if (Array.isArray(value)) return this.renderArray(key, value);
    if (typeof value === 'object' && value !== null) return this.renderObject(key, value);
    return `<div class="card-detail-row"><span class="card-detail-label">${key}</span><span>${value}</span></div>`;
  }
};

/**
 * Генерация HTML карточки товара
 */
export const createCardHTML = (item) => {
  const price = item.price !== undefined ? `${item.price} BYN` : 'Цена не указана';
  const name = item.name || item.title || 'Без названия';

  const excludeKeys = ['id', 'name', 'title', 'price', 'createdAt', 'updatedAt', 'isInStock', 'inStock', 'isAvailable'];
  let detailsHTML = '';

  Object.keys(item).forEach(key => {
    if (!excludeKeys.includes(key)) {
      detailsHTML += FieldRenderer.render(key, item[key]);
    }
  });

  // Определяем статус наличия
  let stockBadge = '';
  if (item.inStock !== undefined || item.isInStock !== undefined || item.isAvailable !== undefined) {
    const isStock = item.inStock ?? item.isInStock ?? item.isAvailable;
    stockBadge = isStock 
      ? `<span class="badge in-stock">В наличии</span>` 
      : `<span class="badge out-of-stock">Нет</span>`;
  }

  return `
    <div class="card" style="display: flex; flex-direction: column; height: 100%;">
      <div class="card-header">
        <h3 class="card-title">${name}</h3>
        <span class="card-price">${price}</span>
      </div>
      <div class="card-body">
        ${detailsHTML || '<p style="font-style: italic; color: #9ca3af;">Нет дополнительной информации</p>'}
      </div>
      <div class="card-footer" style="margin-top: auto; display: flex; align-items: center; justify-content: space-between;">
        ${stockBadge}
      </div>
    </div>
  `;
};
