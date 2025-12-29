
/**
 * Middleware для проверки авторизации.
 */
function authMiddleware(allowedToken) {
  return (req, res, next) => {
    // ИСПРАВЛЕНИЕ: Более мягкая проверка, чтобы точно пропустить логин
    // Проверяем, есть ли '/auth/login' в пути запроса
    if (req.path && req.path.includes('/auth/login')) {
      return next();
    }

    // Пропускаем GET запросы (публичный доступ)
    if (req.method === 'GET') {
      return next();
    }

    // Для остальных проверяем токен
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

    if (token === allowedToken) {
      return next();
    }

    res.status(401).json({ error: true, message: 'Не авторизован' });
  };
}

module.exports = { authMiddleware };
