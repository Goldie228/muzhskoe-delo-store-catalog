
import { api } from './api.js';

/**
 * UI Helper: Управление кастомными модалками и уведомлениями
 */
const UI = {
    toast(msg, type = 'success') {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const el = document.createElement('div');
        el.className = `toast ${type}`;
        el.innerText = msg;
        container.appendChild(el);
        
        setTimeout(() => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            setTimeout(() => el.remove(), 300);
        }, 3000);
    },

    confirm(message, onConfirm) {
        const container = document.getElementById('modal-container');
        if (!container) return;
        
        container.innerHTML = `
            <div class="modal-overlay active">
                <div class="modal confirm-modal">
                    <h3>Подтверждение</h3>
                    <p>${message}</p>
                    <div class="confirm-actions">
                        <button class="btn" style="background:#9ca3af" onclick="UI._closeConfirm()">Отмена</button>
                        <button class="btn" style="background:#ef4444; color:white;" onclick="UI._runConfirm()">Да</button>
                    </div>
                </div>
            </div>
        `;

        UI._tempConfirmCallback = onConfirm;
    },

    _runConfirm() {
        if (UI._tempConfirmCallback) {
            UI._tempConfirmCallback();
            UI._closeConfirm();
        }
    },

    _closeConfirm() {
        const container = document.getElementById('modal-container');
        if (container) container.innerHTML = '';
    }
};

// Методы для вызова из HTML (атрибуты onclick)
UI._runConfirm = UI._runConfirm.bind(UI);
UI._closeConfirm = UI._closeConfirm.bind(UI);

export { UI };

/**
 * Обработчик входа
 */
export const handleLogin = async (e) => {
    e.preventDefault();
    const form = e.target;
    const login = form.login.value;
    const password = form.password.value;

    try {
        const res = await api.post('/auth/login', { login, password });
        if (res.success && res.token) {
            api.setToken(res.token);
            location.hash = '#admin';
        } else {
            UI.toast('Ошибка входа: ' + (res.message || 'Неверный формат ответа'), 'error');
        }
    } catch (err) {
        UI.toast('Ошибка соединения или 401: ' + err.message, 'error');
    }
};

window.handleLogin = handleLogin;
window.UI = UI; // Делаем UI глобальным, чтобы AdminForm мог использовать UI.toast
