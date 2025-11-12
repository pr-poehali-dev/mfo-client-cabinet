interface LoanAgreementProps {
  clientName?: string;
  clientPhone?: string;
  loanAmount?: number;
  loanDate?: string;
  loanId?: string;
}

const LoanAgreementTemplate = ({ 
  clientName = 'Иванов Иван Иванович',
  clientPhone = '+7 (999) 123-45-67',
  loanAmount = 50000,
  loanDate = new Date().toLocaleDateString('ru-RU'),
  loanId = '00001'
}: LoanAgreementProps) => {
  return (
    <div className="p-8 bg-white text-black space-y-6 font-sans">
      <div className="text-center space-y-2 border-b-2 pb-4">
        <h1 className="text-2xl font-bold uppercase">Договор займа</h1>
        <p className="text-sm text-gray-600">№ {loanId} от {loanDate}</p>
      </div>

      <div className="space-y-4">
        <section>
          <h2 className="font-bold mb-2">1. ПРЕДМЕТ ДОГОВОРА</h2>
          <p className="text-sm leading-relaxed">
            1.1. Займодавец передает в собственность Заемщику денежные средства в размере <strong>{loanAmount.toLocaleString('ru-RU')} рублей</strong> (Сумма займа), 
            а Заемщик обязуется возвратить Займодавцу Сумму займа и уплатить проценты на нее в размере и в срок, которые установлены Договором.
          </p>
          <p className="text-sm leading-relaxed mt-2">
            1.2. Сумма займа считается переданной Заемщику с момента зачисления денежных средств на банковский счет или выдачи наличными.
          </p>
        </section>

        <section>
          <h2 className="font-bold mb-2">2. ПРОЦЕНТЫ ПО ЗАЙМУ</h2>
          <p className="text-sm leading-relaxed">
            2.1. За пользование Суммой займа Заемщик уплачивает Займодавцу проценты в размере <strong>24,5% годовых</strong>.
          </p>
          <p className="text-sm leading-relaxed mt-2">
            2.2. Проценты начисляются на непогашенный остаток Суммы займа за каждый день пользования займом.
          </p>
        </section>

        <section>
          <h2 className="font-bold mb-2">3. ПОРЯДОК И СРОК ВОЗВРАТА ЗАЙМА</h2>
          <p className="text-sm leading-relaxed">
            3.1. Заемщик обязуется возвратить Сумму займа и уплатить проценты в течение 12 месяцев с даты получения займа.
          </p>
          <p className="text-sm leading-relaxed mt-2">
            3.2. Возврат суммы займа и процентов производится ежемесячными платежами до 15 числа каждого месяца.
          </p>
          <p className="text-sm leading-relaxed mt-2">
            3.3. Заемщик вправе досрочно погасить займ полностью или частично без штрафных санкций.
          </p>
        </section>

        <section>
          <h2 className="font-bold mb-2">4. ОТВЕТСТВЕННОСТЬ СТОРОН</h2>
          <p className="text-sm leading-relaxed">
            4.1. За нарушение срока возврата займа и/или уплаты процентов Заемщик уплачивает Займодавцу пеню в размере 0,1% от суммы просроченного платежа за каждый день просрочки.
          </p>
          <p className="text-sm leading-relaxed mt-2">
            4.2. При просрочке более 30 дней Займодавец вправе потребовать досрочного возврата всей суммы займа и процентов.
          </p>
        </section>

        <section>
          <h2 className="font-bold mb-2">5. РЕКВИЗИТЫ И ПОДПИСИ СТОРОН</h2>
          <div className="grid grid-cols-2 gap-8 mt-4">
            <div>
              <p className="font-semibold mb-2">ЗАЙМОДАВЕЦ:</p>
              <p className="text-sm">ООО "Финансовая компания"</p>
              <p className="text-sm">ИНН: 7700000000</p>
              <p className="text-sm">ОГРН: 1157700000000</p>
              <p className="text-sm mt-4">_________________ / Директор</p>
              <p className="text-xs text-gray-500 mt-1">подпись</p>
            </div>
            <div>
              <p className="font-semibold mb-2">ЗАЕМЩИК:</p>
              <p className="text-sm">{clientName}</p>
              <p className="text-sm">Телефон: {clientPhone}</p>
              <p className="text-sm mt-8">_________________</p>
              <p className="text-xs text-gray-500 mt-1">подпись</p>
            </div>
          </div>
        </section>
      </div>

      <div className="text-center text-xs text-gray-500 border-t pt-4 mt-8">
        <p>Договор составлен в двух экземплярах, имеющих одинаковую юридическую силу, по одному для каждой из сторон.</p>
      </div>
    </div>
  );
};

export default LoanAgreementTemplate;
