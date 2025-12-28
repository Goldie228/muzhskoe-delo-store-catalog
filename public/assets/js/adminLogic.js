
import { api } from './api.js';
import { ADMIN_CONFIG } from './config.js';
import { UI } from './ui.js';

const AdminForm = {
    open(mode, item, moduleKey) {
        const config = ADMIN_CONFIG[moduleKey];
        const modal = document.getElementById('modal-container');
        if (!modal) return;

        // Генерация полей формы
        let fieldsHTML = config.fields.map(field => {
            const value = (mode === 'edit' && item) ? (item[field.key] || '') : '';

            if (field.type === 'checkbox') {
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
        
        const numberFields = ['price', 'volume', 'strength', 'voltage', 'current', 'birthYear', 'foundedYear', 'sortOrder'];

        ADMIN_CONFIG[moduleKey].fields.forEach(field => {
            let val = formData.get(field.key);

            if (field.type === 'checkbox') {
                data[field.key] = val === 'on';
            } else if (field.key.includes('ingredients') || field.key.includes('tags') || field.key.includes('specifications')) {
                data[field.key] = val ? val.split(',').map(s => s.trim()) : [];
            } else if (numberFields.includes(field.key)) {
                data[field.key] = parseFloat(val) || 0;
            } else {
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
            
            // Мгновенное обновление
            if (window.router) {
                window.router.handleRoute();
            }
        } catch (error) {
            console.error('Ошибка сохранения:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Неизвестная ошибка';
            UI.toast(`Ошибка: ${errorMessage}`, 'error');
        }
    }
};

export { AdminForm };
window.AdminForm = AdminForm;

/**
 * Глобальная функция открытия редактирования.
 * Позволяет безопасно передавать ID через onclick без JSON.stringify.
 */
window.openEdit = async (id, moduleKey) => {
    try {
        const endpoint = ADMIN_CONFIG[moduleKey].endpoint;
        const res = await api.get(`${endpoint}/${id}`);
        // Передаем полученный объект целиком в AdminForm
        AdminForm.open('edit', res.data, moduleKey);
    } catch (error) {
        console.error('Ошибка загрузки данных для редактирования:', error);
        UI.toast('Не удалось загрузить данные', 'error');
    }
};

/**
 * Глобальная функция удаления
 */
export const deleteItem = async (moduleKey, id) => {
    UI.confirm('Вы уверены, что хотите удалить запись?', async () => {
        try {
            await api.delete(ADMIN_CONFIG[moduleKey].endpoint + '/' + id);
            UI.toast('Запись удалена', 'success');
            
            if (window.router) {
                window.router.handleRoute();
            }
        } catch (error) {
            UI.toast('Ошибка удаления: ' + error.message, 'error');
        }
    });
};

window.deleteItem = deleteItem;
