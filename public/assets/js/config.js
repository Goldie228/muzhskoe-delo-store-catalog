
/**
 * Конфигурация админ-панели
 * Содержит настройки полей форм для каждого модуля, согласно API документации.
 */
export const ADMIN_CONFIG = {
    // --- Еда (Food Service) ---
    food: {
        label: 'Блюда',
        endpoint: '/food',
        fields: [
            { key: 'name', label: 'Название блюда', type: 'text' },
            { key: 'price', label: 'Цена (BYN)', type: 'number' },
            { key: 'inStock', label: 'В наличии', type: 'checkbox' },
            { key: 'ingredients', label: 'Ингредиенты (через запятую)', type: 'text' }
        ]
    },

    // --- Электроника (Electronics Service) ---
    electronics: {
        label: 'Электроника',
        endpoint: '/electronics/goods',
        fields: [
            { key: 'name', label: 'Название товара', type: 'text' },
            { key: 'category', label: 'Категория', type: 'text' },
            { key: 'price', label: 'Цена (BYN)', type: 'number' },
            { key: 'voltage', label: 'Напряжение (В)', type: 'number' },
            { key: 'current', label: 'Ток (А)', type: 'number' },
            { key: 'isInStock', label: 'В наличии', type: 'checkbox' },
            { key: 'specifications', label: 'Характеристики (через запятую)', type: 'text' }
        ]
    },

    // --- Алкоголь (Alcohol Service) ---
    alcohol: {
        label: 'Напитки',
        endpoint: '/alcohol/beverages',
        fields: [
            { key: 'name', label: 'Название напитка', type: 'text' },
            { key: 'price', label: 'Цена (BYN)', type: 'number' },
            { key: 'type', label: 'Тип (вино, виски и т.д.)', type: 'text' },
            { key: 'strength', label: 'Крепость (%)', type: 'number' },
            { key: 'volume', label: 'Объем (мл)', type: 'number' },
            { key: 'inStock', label: 'В наличии', type: 'checkbox' },
            { key: 'ingredients', label: 'Ингредиенты (через запятую)', type: 'text' },
            { key: 'tags', label: 'Теги (через запятую)', type: 'text' }
        ]
    },

    // --- Философия (Philosophy Service) ---
    philosophy: {
        label: 'Книги',
        endpoint: '/philosophy/books',
        fields: [
            // ВАЖНО: API ждет поле 'title', а не 'name'
            { key: 'title', label: 'Название книги', type: 'text' },
            { key: 'price', label: 'Цена (BYN)', type: 'number' },
            { key: 'isAvailable', label: 'В наличии', type: 'checkbox' },
            { key: 'publishDate', label: 'Дата публикации', type: 'date' },
            { key: 'tags', label: 'Теги (через запятую)', type: 'text' }
        ]
    }
};
