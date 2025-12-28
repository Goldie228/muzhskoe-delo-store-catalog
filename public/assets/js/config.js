
export const ADMIN_CONFIG = {
    food: {
        label: 'Еда',
        endpoint: '/food',
        fields: [
            { key: 'name', label: 'Название блюда', type: 'text' },
            { key: 'price', label: 'Цена (BYN)', type: 'number' },
            { key: 'inStock', label: 'В наличии', type: 'checkbox' },
            { key: 'ingredients', label: 'Ингредиенты (через запятую)', type: 'text' }
        ]
    },
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
    alcohol: {
        label: 'Алкоголь',
        endpoint: '/alcohol/beverages',
        fields: [
            { key: 'name', label: 'Название', type: 'text' },
            { key: 'type', label: 'Тип', type: 'text' },
            { key: 'price', label: 'Цена (BYN)', type: 'number' },
            { key: 'strength', label: 'Крепость (%)', type: 'number' },
            { key: 'volume', label: 'Объем (мл)', type: 'number' },
            { key: 'inStock', label: 'В наличии', type: 'checkbox' },
            { key: 'tags', label: 'Теги (через запятую)', type: 'text' }
        ]
    },
    philosophy: {
        label: 'Книги',
        endpoint: '/philosophy/books',
        fields: [
            { key: 'title', label: 'Название книги', type: 'text' },
            { key: 'price', label: 'Цена (BYN)', type: 'number' },
            { key: 'isAvailable', label: 'В наличии', type: 'checkbox' },
            { key: 'publishDate', label: 'Дата публикации', type: 'date' },
            { key: 'tags', label: 'Теги (через запятую)', type: 'text' }
        ]
    }
};
