import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';

interface ConnectionTestProps {
  testLoading: boolean;
  testResult: { success: boolean; message: string } | null;
  onTest: () => void;
}

const ConnectionTest = ({ testLoading, testResult, onTest }: ConnectionTestProps) => {
  return (
    <div className="mb-6">
      <Button
        onClick={onTest}
        disabled={testLoading}
        variant="outline"
        className="w-full"
      >
        {testLoading ? (
          <>
            <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
            Проверка подключения...
          </>
        ) : (
          <>
            <Icon name="Wifi" size={20} className="mr-2" />
            Проверить подключение к AmoCRM
          </>
        )}
      </Button>

      {testResult && (
        <Alert className={`mt-4 ${testResult.success ? 'bg-accent/10 border-accent/30' : 'bg-destructive/10 border-destructive/30'}`}>
          <Icon name={testResult.success ? 'CheckCircle' : 'AlertCircle'} size={18} className={testResult.success ? 'text-accent' : 'text-destructive'} />
          <AlertDescription className={testResult.success ? 'text-accent' : 'text-destructive'}>
            {testResult.message}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ConnectionTest;
