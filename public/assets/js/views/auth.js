
import { ICONS } from '../icons.js';

export const login = () => `
    <div class="login-container">
        <div class="login-card">
            ${ICONS.user}
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
`;
