
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
                UI.toast('Запись успешно создана', 'success');
            } else if (mode === 'edit') {
                await api.put(`${ADMIN_CONFIG[moduleKey].endpoint}/${item.id}`, data);
                UI.toast('Запись успешно обновлена', 'success');
            }
            AdminForm.close();
            location.hash = '#admin/' + moduleKey;
        } catch (error) {
            UI.toast('Ошибка сохранения: ' + error.message, 'error');
        }
    }
};

export { AdminForm };
window.AdminForm = AdminForm; // Делаем глобальным для onclick

/**
 * Глобальная функция удаления
 */
export const deleteItem = async (moduleKey, id) => {
    UI.confirm('Вы уверены, что хотите удалить запись?', async () => {
        try {
            await api.delete(ADMIN_CONFIG[moduleKey].endpoint + '/' + id);
            UI.toast('Запись удалена', 'success');
            location.hash = '#admin/' + moduleKey;
        } catch (e) {
            UI.toast('Ошибка удаления: ' + e.message, 'error');
        }
    });
};

window.deleteItem = deleteItem;
