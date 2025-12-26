
/**
 * Класс для взаимодействия с API сервера
 */
class ApiClient {
    constructor(baseUrl = '/api') {
        this.baseUrl = baseUrl;
    }

    /**
     * Выполняет GET запрос
     */
    async get(endpoint) {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`);
            if (!response.ok) {
                throw new Error(`Ошибка HTTP: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Ошибка запроса к API:', error);
            throw error;
        }
    }
}

export const api = new ApiClient();
