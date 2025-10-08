import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const AdminCleanup = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const runCleanup = async (dryRun: boolean) => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(
        `https://functions.poehali.dev/addb6e88-5455-4441-99f0-c2fbef7911d3?dry_run=${dryRun}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ success: false, error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <h1 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <Icon name="Trash2" size={32} className="text-red-400" />
            Очистка дублей заявок в AmoCRM
          </h1>

          <div className="space-y-4 mb-6">
            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
              <p className="text-yellow-100 text-sm">
                ⚠️ <strong>Внимание:</strong> Эта функция удаляет дубли заявок в AmoCRM.
                Для каждого клиента оставляется только САМАЯ НОВАЯ заявка.
              </p>
            </div>

            <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
              <p className="text-blue-100 text-sm">
                ℹ️ Сначала запустите <strong>Тестовый запуск</strong> чтобы посмотреть что будет удалено
              </p>
            </div>
          </div>

          <div className="flex gap-4 mb-8">
            <Button
              onClick={() => runCleanup(true)}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                <>
                  <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                  Загрузка...
                </>
              ) : (
                <>
                  <Icon name="Eye" size={18} className="mr-2" />
                  Тестовый запуск (без удаления)
                </>
              )}
            </Button>

            <Button
              onClick={() => runCleanup(false)}
              disabled={loading}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? (
                <>
                  <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                  Загрузка...
                </>
              ) : (
                <>
                  <Icon name="Trash2" size={18} className="mr-2" />
                  Удалить дубли (реально)
                </>
              )}
            </Button>
          </div>

          {result && (
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Icon
                  name={result.success ? 'CheckCircle' : 'XCircle'}
                  size={24}
                  className={result.success ? 'text-green-400' : 'text-red-400'}
                />
                Результат
              </h2>

              {result.success ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 rounded-lg p-4">
                      <p className="text-gray-400 text-sm mb-1">Всего заявок</p>
                      <p className="text-2xl font-bold text-white">{result.total_leads}</p>
                    </div>

                    <div className="bg-white/10 rounded-lg p-4">
                      <p className="text-gray-400 text-sm mb-1">Контактов с дублями</p>
                      <p className="text-2xl font-bold text-yellow-400">
                        {result.duplicates_found}
                      </p>
                    </div>

                    <div className="bg-white/10 rounded-lg p-4">
                      <p className="text-gray-400 text-sm mb-1">
                        {result.dry_run ? 'Будет удалено' : 'Удалено'}
                      </p>
                      <p className="text-2xl font-bold text-red-400">
                        {result.dry_run ? result.leads_to_delete : result.deleted_count}
                      </p>
                    </div>

                    <div className="bg-white/10 rounded-lg p-4">
                      <p className="text-gray-400 text-sm mb-1">Режим</p>
                      <p className="text-lg font-bold text-blue-400">
                        {result.dry_run ? '🧪 ТЕСТ' : '✅ РЕАЛЬНО'}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white/10 rounded-lg p-4">
                    <p className="text-white font-medium mb-2">{result.message}</p>
                  </div>

                  {result.contact_details && result.contact_details.length > 0 && (
                    <div>
                      <h3 className="text-white font-bold mb-3">
                        Примеры контактов с дублями (первые 10):
                      </h3>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {result.contact_details.map((detail: any, idx: number) => (
                          <div
                            key={idx}
                            className="bg-white/5 border border-white/10 rounded p-3"
                          >
                            <p className="text-gray-300 text-sm">
                              <strong>Контакт ID:</strong> {detail.contact_id}
                            </p>
                            <p className="text-gray-300 text-sm">
                              <strong>Всего заявок:</strong> {detail.total_leads}
                            </p>
                            <p className="text-green-400 text-sm">
                              <strong>Оставлена:</strong> {detail.kept_lead_id}
                            </p>
                            <p className="text-red-400 text-sm">
                              <strong>Удалены:</strong> {detail.deleted_lead_ids.join(', ')}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
                  <p className="text-red-100">
                    <strong>Ошибка:</strong> {result.error}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCleanup;
