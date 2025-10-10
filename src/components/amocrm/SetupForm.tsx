import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';

interface SetupFormProps {
  subdomain: string;
  setSubdomain: (value: string) => void;
  clientId: string;
  setClientId: (value: string) => void;
  clientSecret: string;
  setClientSecret: (value: string) => void;
  redirectUri: string;
  setRedirectUri: (value: string) => void;
  code: string;
  setCode: (value: string) => void;
  error: string;
  loading: boolean;
  onGetToken: () => void;
}

const SetupForm = ({
  subdomain,
  setSubdomain,
  clientId,
  setClientId,
  clientSecret,
  setClientSecret,
  redirectUri,
  setRedirectUri,
  code,
  setCode,
  error,
  loading,
  onGetToken
}: SetupFormProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="subdomain">Поддомен AmoCRM</Label>
        <Input
          id="subdomain"
          placeholder="mycompany"
          value={subdomain}
          onChange={(e) => setSubdomain(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Из адреса: https://<strong>mycompany</strong>.amocrm.ru
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="clientId">ID интеграции (Client ID)</Label>
        <Input
          id="clientId"
          placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="clientSecret">Секретный ключ (Client Secret)</Label>
        <Input
          id="clientSecret"
          type="password"
          placeholder="xxxxxxxxxxxxxxxxxxxxxxxx"
          value={clientSecret}
          onChange={(e) => setClientSecret(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="redirectUri">Redirect URI</Label>
        <Input
          id="redirectUri"
          placeholder="https://example.com"
          value={redirectUri}
          onChange={(e) => setRedirectUri(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Должен совпадать с указанным в настройках интеграции
        </p>
      </div>

      {subdomain && clientId && redirectUri && (
        <Alert className="bg-secondary/10 border-secondary/30">
          <Icon name="Link" size={18} />
          <AlertDescription>
            <p className="font-semibold mb-2">Ссылка для авторизации:</p>
            <div className="flex gap-2">
              <code className="flex-1 p-2 bg-muted/50 rounded text-xs break-all">
                {`https://${subdomain}.amocrm.ru/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&state=random_string`}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(`https://${subdomain}.amocrm.ru/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&state=random_string`, '_blank')}
              >
                <Icon name="ExternalLink" size={16} />
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="code">Код авторизации (из URL после авторизации)</Label>
        <Input
          id="code"
          placeholder="def50200..."
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          После авторизации скопируйте параметр <code>code=</code> из адресной строки
        </p>
      </div>

      {error && (
        <Alert className="bg-destructive/10 border-destructive/30">
          <Icon name="AlertCircle" size={18} className="text-destructive" />
          <AlertDescription className="text-destructive">
            {error}
          </AlertDescription>
        </Alert>
      )}

      <Button
        onClick={onGetToken}
        disabled={loading}
        className="w-full bg-gradient-to-r from-primary to-secondary"
      >
        {loading ? (
          <>
            <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
            Получение токена...
          </>
        ) : (
          <>
            <Icon name="Key" size={20} className="mr-2" />
            Получить Access Token
          </>
        )}
      </Button>
    </div>
  );
};

export default SetupForm;
