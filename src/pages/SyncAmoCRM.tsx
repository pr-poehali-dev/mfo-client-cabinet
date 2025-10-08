import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';

const SyncAmoCRM = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSync = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('https://functions.poehali.dev/57ce00dc-62f2-4416-871a-0eb184917afe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Sync error:', error);
      setResult({ success: false, error: 'Ошибка синхронизации' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f1419] flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
            <Icon name="RefreshCw" size={32} className="text-white" />
          </div>
          <CardTitle className="text-3xl font-montserrat">
            Синхронизация AmoCRM
          </CardTitle>
          <CardDescription>
            Загрузить все заявки из AmoCRM в базу данных
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <Alert>
              <Icon name="Info" size={18} />
              <AlertDescription>
                <strong>Что делает синхронизация:</strong>
                <ul className="list-disc ml-4 mt-2 space-y-1 text-sm">
                  <li>Загружает все сделки из AmoCRM</li>
                  <li>Создаёт недостающих клиентов в базе данных</li>
                  <li>Добавляет новые заявки в систему</li>
                  <li>Пропускает уже существующие заявки</li>
                </ul>
              </AlertDescription>
            </Alert>

            <Button
              onClick={handleSync}
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
            >
              {loading ? (
                <>
                  <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                  Синхронизация...
                </>
              ) : (
                <>
                  <Icon name="RefreshCw" size={20} className="mr-2" />
                  Запустить синхронизацию
                </>
              )}
            </Button>

            {result && (
              <Alert className={result.success ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}>
                <Icon name={result.success ? 'CheckCircle' : 'AlertCircle'} size={18} className={result.success ? 'text-green-500' : 'text-red-500'} />
                <AlertDescription className={result.success ? 'text-green-500' : 'text-red-500'}>
                  {result.success ? (
                    <div className="space-y-2">
                      <p className="font-semibold">{result.message}</p>
                      <ul className="list-disc ml-4 text-sm">
                        <li>Всего синхронизировано: {result.synced_deals}</li>
                        <li>Новых заявок добавлено: {result.new_deals}</li>
                        <li>Пропущено (уже есть): {result.skipped_deals}</li>
                      </ul>
                    </div>
                  ) : (
                    <p>{result.error || 'Ошибка синхронизации'}</p>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SyncAmoCRM;
