import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';

const CleanupDeals = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleCleanup = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('https://functions.poehali.dev/88a1f443-5722-411a-8502-d09ca9fc51eb', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Cleanup error:', error);
      setResult({ success: false, error: 'Ошибка очистки данных' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f1419] flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center">
            <Icon name="Trash2" size={32} className="text-white" />
          </div>
          <CardTitle className="text-3xl font-montserrat">
            Очистка тестовых заявок
          </CardTitle>
          <CardDescription>
            Удалить все заявки кроме последней для каждого клиента
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <Alert>
              <Icon name="AlertTriangle" size={18} />
              <AlertDescription>
                <strong>Внимание!</strong> Эта операция удалит все тестовые заявки из базы данных.
                Будет оставлена только последняя заявка для каждого клиента.
              </AlertDescription>
            </Alert>

            <Button
              onClick={handleCleanup}
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
            >
              {loading ? (
                <>
                  <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                  Очистка...
                </>
              ) : (
                <>
                  <Icon name="Trash2" size={20} className="mr-2" />
                  Очистить базу данных
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
                        <li>Заявок до очистки: {result.deals_before}</li>
                        <li>Заявок после очистки: {result.deals_after}</li>
                        <li>Удалено заявок: {result.deleted_deals}</li>
                      </ul>
                    </div>
                  ) : (
                    <p>{result.error || 'Ошибка очистки'}</p>
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

export default CleanupDeals;
