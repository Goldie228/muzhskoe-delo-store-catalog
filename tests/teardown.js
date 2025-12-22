module.exports = async () => {
  // Очистка после всех тестов (если нужно)
  // Например: удалить временные файлы, сбросить окружение и т.д.
  // Логируем кратко — в тестах console.log мокнут, но в teardown он может быть полезен
  // (jest выполнит teardown после восстановления окружения)
  // eslint-disable-next-line no-console
  console.log('\n✅ All tests completed');
};
