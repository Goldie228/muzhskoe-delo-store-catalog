
import { ICONS } from '../icons.js';

export const home = () => `
    <div class="hero">
        <h2>Мужское Дело</h2>
        <p>Всё необходимое для современного мужчины: от инструментов до книг, от техники до элитного алкоголя.</p>
        <div class="items-grid">
            <div class="card" style="cursor: pointer; text-align:center; padding: 2rem;" onclick="window.location.hash='#food'">
                ${ICONS.foodLarge}
                <h3 style="margin-top:0;">Еда</h3>
            </div>
            <div class="card" style="cursor: pointer; text-align:center; padding: 2rem;" onclick="window.location.hash='#electronics'">
                ${ICONS.electronicsLarge}
                <h3 style="margin-top:0;">Электроника</h3>
            </div>
            <div class="card" style="cursor: pointer; text-align:center; padding: 2rem;" onclick="window.location.hash='#alcohol'">
                ${ICONS.alcoholLarge}
                <h3 style="margin-top:0;">Напитки</h3>
            </div>
            <div class="card" style="cursor: pointer; text-align:center; padding: 2rem;" onclick="window.location.hash='#philosophy'">
                ${ICONS.philosophyLarge}
                <h3 style="margin-top:0;">Книги</h3>
            </div>
        </div>
    </div>
`;
