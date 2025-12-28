
import { api } from './api.js';
import { ADMIN_CONFIG } from './config.js';
import { UI } from './ui.js';

/**
 * Утилита для рендера форм
 */
const AdminForm = {
    open(mode, item, moduleKey) {
        const config = ADMIN_CONFIG[moduleKey];
        const modal = document.getElementById('modal-container');
        if (!modal) return;

        // Генерация полей формы
        let fieldsHTML = config.fields.map(field => {
            const value = (mode === 'edit' && item) ? (item[field.key] || '') : '';

            if (field.type === 'checkbox') {
                // Фикс: делаем label flex-контейнером
                return `
                    <div class="form-group" style="display:flex; align-items:center; gap:10px;">
                        <input type="checkbox" name="${field.key}" class="form-control" style="width:auto;" ${value ? 'checked' : ''}>
                        <label style="margin:0; cursor:pointer;">${field.label}</label>
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
                            <button type="button" class="btn btn-secondary" onclick="AdminForm.close()">Отмена</button>
                            <button type="submit" class="btn">Сохранить</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        // Вешаем слушатель
        const form = document.getElementById('admin-form');
        if (form) {
            const newForm = form.cloneNode(true);
            form.parentNode.replaceChild(newForm, form);

            newForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await AdminForm.submit(mode, item, moduleKey);
            });
        }
    },

    close() {
        const modal = document.getElementById('modal-container');
        if (modal) modal.innerHTML = '';
    },

    async submit(mode, item, moduleKey) {
        const formData = new FormData(document.getElementById('admin-form'));
        const data = {};
        
        // Список полей, которые нужно привести к числам
        const numberFields = ['price', 'volume', 'strength', 'voltage', 'current', 'birthYear', 'foundedYear', 'sortOrder'];

        ADMIN_CONFIG[moduleKey].fields.forEach(field => {
            let val = formData.get(field.key);

            if (field.type === 'checkbox') {
                data[field.key] = val === 'on';
            } else if (field.key.includes('ingredients') || field.key.includes('tags') || field.key.includes('specifications')) {
                // Массивы
                data[field.key] = val ? val.split(',').map(s => s.trim()) : [];
            } else if (numberFields.includes(field.key)) {
                // Числа
                data[field.key] = parseFloat(val) || 0;
            } else {
                // Строки
                data[field.key] = val;
            }
        });

        try {
            if (mode === 'create') {
                await api.post(ADMIN_CONFIG[moduleKey].endpoint, data);
                UI.toast('Запись успешно создана', 'success');
            } else if (mode === 'edit') {
                await api.put(`${ADMIN_CONFIG[moduleKey].endpoint}/${item.id}`, data);
                UI.toast('Запись успешно обновлена', 'success');
            }
            AdminForm.close();
            
            // --- ВАЖНО: МГНОВЕННОЕ ОБНОВЛЕНИЕ ---
            // Не меняем хеш (вызывает перерисовку), а вызываем роутер напрямую.
            if (window.router) {
                window.router.handleRoute();
            }
        } catch (error) {
            console.error('Ошибка API:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Неизвестная ошибка';
            UI.toast(`Ошибка: ${errorMessage}`, 'error');
        }
    }
};

export { AdminForm };
window.AdminForm = AdminForm; // Глобально для onclick


/**
 * Глобальная функция удаления
 */
export const deleteItem = async (moduleKey, id) => {
    UI.confirm('Вы уверены, что хотите удалить запись?', async () => {
        try {
            await api.delete(ADMIN_CONFIG[moduleKey].endpoint + '/' + id);
            UI.toast('Запись удалена', 'success');
            
            // --- ВАЖНО: МГНОВЕННОЕ ОБНОВЛЕНИЕ ---
            if (window.router) {
                window.router.handleRoute();
            }
        } catch (error) {
            console.error('Ошибка удаления:', error);
            UI.toast('Ошибка удаления: ' + error.message, 'error');
        }
    });
};

window.deleteItem = deleteItem;
