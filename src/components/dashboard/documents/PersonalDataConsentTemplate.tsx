interface PersonalDataConsentProps {
  clientName?: string;
  clientPhone?: string;
  consentDate?: string;
}

const PersonalDataConsentTemplate = ({ 
  clientName = 'Иванов Иван Иванович',
  clientPhone = '+7 (999) 123-45-67',
  consentDate = new Date().toLocaleDateString('ru-RU')
}: PersonalDataConsentProps) => {
  return (
    <div className="p-8 bg-white text-black space-y-6 font-sans">
      <div className="text-center space-y-2 border-b-2 pb-4">
        <h1 className="text-2xl font-bold uppercase">Согласие на обработку персональных данных</h1>
        <p className="text-sm text-gray-600">от {consentDate}</p>
      </div>

      <div className="space-y-4">
        <p className="text-sm leading-relaxed">
          Я, <strong>{clientName}</strong>, контактный телефон <strong>{clientPhone}</strong>, 
          действуя свободно, своей волей и в своем интересе, даю согласие ООО "Финансовая компания" (далее — Оператор), 
          расположенному по адресу: г. Москва, на обработку своих персональных данных на следующих условиях:
        </p>

        <section>
          <h2 className="font-bold mb-2">1. ПЕРЕЧЕНЬ ПЕРСОНАЛЬНЫХ ДАННЫХ</h2>
          <p className="text-sm leading-relaxed">
            Согласие дается на обработку следующих персональных данных:
          </p>
          <ul className="list-disc list-inside text-sm space-y-1 ml-4 mt-2">
            <li>Фамилия, имя, отчество</li>
            <li>Дата и место рождения</li>
            <li>Паспортные данные (серия, номер, кем и когда выдан)</li>
            <li>Адрес регистрации и фактического проживания</li>
            <li>Контактные данные (телефон, email)</li>
            <li>Сведения о трудовой деятельности</li>
            <li>Фотографии</li>
            <li>Иные данные, необходимые для заключения и исполнения договора займа</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold mb-2">2. ЦЕЛИ ОБРАБОТКИ ПЕРСОНАЛЬНЫХ ДАННЫХ</h2>
          <p className="text-sm leading-relaxed">
            Персональные данные обрабатываются в целях:
          </p>
          <ul className="list-disc list-inside text-sm space-y-1 ml-4 mt-2">
            <li>Идентификации субъекта персональных данных</li>
            <li>Заключения, исполнения и прекращения договоров</li>
            <li>Предоставления финансовых услуг</li>
            <li>Проведения проверки платежеспособности</li>
            <li>Взыскания задолженности</li>
            <li>Направления информационных сообщений</li>
            <li>Исполнения требований законодательства РФ</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold mb-2">3. ДЕЙСТВИЯ С ПЕРСОНАЛЬНЫМИ ДАННЫМИ</h2>
          <p className="text-sm leading-relaxed">
            Согласие дается на совершение следующих действий с персональными данными:
          </p>
          <ul className="list-disc list-inside text-sm space-y-1 ml-4 mt-2">
            <li>Сбор</li>
            <li>Запись</li>
            <li>Систематизация</li>
            <li>Накопление</li>
            <li>Хранение</li>
            <li>Уточнение (обновление, изменение)</li>
            <li>Извлечение</li>
            <li>Использование</li>
            <li>Передача (распространение, предоставление, доступ)</li>
            <li>Обезличивание</li>
            <li>Блокирование</li>
            <li>Удаление</li>
            <li>Уничтожение</li>
          </ul>
          <p className="text-sm leading-relaxed mt-2">
            Обработка персональных данных может осуществляться как с использованием средств автоматизации, 
            так и без использования таких средств.
          </p>
        </section>

        <section>
          <h2 className="font-bold mb-2">4. ПЕРЕДАЧА ПЕРСОНАЛЬНЫХ ДАННЫХ</h2>
          <p className="text-sm leading-relaxed">
            Согласие дается на передачу персональных данных третьим лицам:
          </p>
          <ul className="list-disc list-inside text-sm space-y-1 ml-4 mt-2">
            <li>Бюро кредитных историй</li>
            <li>Банковским организациям</li>
            <li>Коллекторским агентствам</li>
            <li>Государственным органам (по запросу)</li>
            <li>Иным лицам в случаях, предусмотренных законодательством РФ</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold mb-2">5. СРОК ДЕЙСТВИЯ СОГЛАСИЯ</h2>
          <p className="text-sm leading-relaxed">
            Настоящее согласие действует с момента его подписания и до момента его отзыва субъектом персональных данных.
          </p>
          <p className="text-sm leading-relaxed mt-2">
            После исполнения всех обязательств по договору займа согласие действует в течение 5 (пяти) лет 
            или иного срока, установленного законодательством РФ.
          </p>
        </section>

        <section>
          <h2 className="font-bold mb-2">6. ПРАВА СУБЪЕКТА ПЕРСОНАЛЬНЫХ ДАННЫХ</h2>
          <p className="text-sm leading-relaxed">
            Я проинформирован(а) о своих правах:
          </p>
          <ul className="list-disc list-inside text-sm space-y-1 ml-4 mt-2">
            <li>Получать информацию об обработке моих персональных данных</li>
            <li>Требовать уточнения персональных данных</li>
            <li>Требовать блокирования или уничтожения персональных данных</li>
            <li>Отозвать настоящее согласие</li>
            <li>Обжаловать действия Оператора в уполномоченный орган или суд</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold mb-2">7. ОТЗЫВ СОГЛАСИЯ</h2>
          <p className="text-sm leading-relaxed">
            Согласие может быть отозвано путем направления письменного заявления Оператору. 
            В случае отзыва согласия Оператор прекращает обработку персональных данных, 
            за исключением случаев, когда обработка необходима для исполнения обязательств 
            или требований законодательства РФ.
          </p>
        </section>

        <div className="mt-8 pt-6 border-t">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-sm mb-2"><strong>Субъект персональных данных:</strong></p>
              <p className="text-sm">{clientName}</p>
              <p className="text-sm mt-4">_________________ </p>
              <p className="text-xs text-gray-500 mt-1">подпись</p>
            </div>
            <div>
              <p className="text-sm mb-2"><strong>Дата:</strong></p>
              <p className="text-sm">{consentDate}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-gray-500 border-t pt-4 mt-8">
        <p>Согласие составлено в соответствии с Федеральным законом от 27.07.2006 № 152-ФЗ "О персональных данных"</p>
      </div>
    </div>
  );
};

export default PersonalDataConsentTemplate;
