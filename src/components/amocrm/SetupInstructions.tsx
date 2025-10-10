import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';

const SetupInstructions = () => {
  return (
    <>
      <Accordion type="single" collapsible className="mb-6">
        <AccordionItem value="instruction" className="border border-blue-500/30 rounded-lg px-4 bg-blue-500/5">
          <AccordionTrigger className="text-blue-100 hover:text-blue-50">
            <div className="flex items-center gap-2">
              <Icon name="BookOpen" size={18} />
              <strong>📖 Подробная инструкция: Как создать интеграцию в AmoCRM</strong>
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-sm text-gray-300 space-y-4 pt-4">
            <div className="space-y-3">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                  <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">1</span>
                  Войдите в AmoCRM
                </h4>
                <p>Откройте ваш аккаунт AmoCRM: <code className="bg-white/10 px-2 py-1 rounded">https://ваш-поддомен.amocrm.ru</code></p>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                  <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">2</span>
                  Откройте настройки интеграций
                </h4>
                <ul className="list-disc ml-6 space-y-1">
                  <li>Нажмите на <strong>иконку профиля</strong> (правый верхний угол)</li>
                  <li>Выберите <strong>"Настройки"</strong></li>
                  <li>В левом меню найдите раздел <strong>"Интеграции"</strong></li>
                </ul>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                  <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">3</span>
                  Создайте новую интеграцию
                </h4>
                <ul className="list-disc ml-6 space-y-1">
                  <li>Нажмите <strong>"+ Создать интеграцию"</strong> в правом верхнем углу</li>
                  <li>Выберите <strong>"Создать приватную интеграцию"</strong></li>
                  <li>Заполните название (например: "Личный кабинет клиентов")</li>
                </ul>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                  <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">4</span>
                  Настройте Redirect URI
                </h4>
                <p className="mb-2">В поле <strong>"Redirect URI"</strong> вставьте:</p>
                <code className="block bg-black/30 px-3 py-2 rounded border border-primary/30 text-primary">https://poehali.dev/amocrm-setup</code>
                <p className="mt-2 text-yellow-300">⚠️ Это обязательное поле! Без него авторизация не сработает.</p>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                  <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">5</span>
                  Настройте права доступа
                </h4>
                <p className="mb-2">Включите следующие разрешения:</p>
                <ul className="list-disc ml-6 space-y-1">
                  <li>✅ Контакты: <strong>Чтение</strong> и <strong>Запись</strong></li>
                  <li>✅ Сделки: <strong>Чтение</strong> и <strong>Запись</strong></li>
                  <li>✅ Задачи: <strong>Чтение</strong> и <strong>Запись</strong></li>
                  <li>✅ Примечания: <strong>Чтение</strong> и <strong>Запись</strong></li>
                </ul>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                  <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">6</span>
                  Сохраните интеграцию
                </h4>
                <p>Нажмите <strong>"Сохранить"</strong> внизу страницы</p>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-green-500/30">
                <h4 className="font-bold text-green-400 mb-2 flex items-center gap-2">
                  <Icon name="CheckCircle" size={18} />
                  Скопируйте данные для подключения
                </h4>
                <p className="mb-2">После сохранения вы увидите:</p>
                <ul className="list-disc ml-6 space-y-1">
                  <li><strong>ID интеграции</strong> (Client ID) - UUID формата</li>
                  <li><strong>Секретный ключ</strong> (Client Secret) - длинная строка</li>
                </ul>
                <p className="mt-2 text-green-300">✅ Скопируйте эти значения и вставьте в поля ниже!</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Alert>
        <Icon name="Info" size={18} />
        <AlertDescription>
          <strong>Краткая инструкция:</strong>
          <ol className="list-decimal ml-4 mt-2 space-y-1 text-sm">
            <li>Зайдите в AmoCRM → Настройки → Интеграции</li>
            <li>Создайте новую интеграцию или используйте существующую</li>
            <li>Скопируйте ID интеграции и Секретный ключ</li>
            <li>Перейдите по ссылке авторизации (будет ниже)</li>
            <li>Скопируйте код из адресной строки после авторизации</li>
          </ol>
        </AlertDescription>
      </Alert>
    </>
  );
};

export default SetupInstructions;
