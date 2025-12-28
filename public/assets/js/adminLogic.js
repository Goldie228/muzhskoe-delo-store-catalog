
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
            // Если редактирование, берем значения из item
            const value = (mode === 'edit' && item) ? (item[field.key] || '') : '';
            
            // Обработка массивов (ингредиенты и т.д.)
            const inputValue = Array.isArray(value) ? value.join(', ') : value;

            return `
                <div class="form-group">
                    <label>${field.label}</label>
                    ${field.type === 'checkbox' 
                        ? `<input type="checkbox" name="${field.key}" class="form-control" ${value ? 'checked' : ''}> ${field.label}` 
                        : `<input type="${field.type}" name="${field.key}" value="${inputValue}" class="form-control">`
                    }
                </div>`;
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

        // Повешиваем слушатель на форму (каждый раз новую форму, чтобы не дублировать события)
        const form = document.getElementById('admin-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
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
            } else if (field.key.includes('ingredients') || field.key.includes('tags')) {
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
            // ОБНОВЛЕНИЕ ДАННЫХ БЕЗ ПЕРЕЗАГРУЗКИ
            if (window.router) {
                window.router.handleRoute();
            }
        } catch (error) {
            UI.toast('Ошибка сохранения: ' + error.message, 'error');
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
            
            // ОБНОВЛЕНИЕ ДАННЫХ БЕЗ ПЕРЕЗАГРУЗКИ
            if (window.router) {
                window.router.handleRoute();
            }
        } catch (error) {
            UI.toast('Ошибка удаления: ' + error.message, 'error');
        }
    });
};

window.deleteItem = deleteItem;
