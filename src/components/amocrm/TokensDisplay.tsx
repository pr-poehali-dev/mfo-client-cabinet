import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';

interface TokensDisplayProps {
  accessToken: string;
  refreshToken: string;
  subdomain: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  onCopyToClipboard: (text: string) => void;
}

const TokensDisplay = ({
  accessToken,
  refreshToken,
  subdomain,
  clientId,
  clientSecret,
  redirectUri,
  onCopyToClipboard
}: TokensDisplayProps) => {
  return (
    <div className="space-y-6">
      <Alert className="bg-accent/10 border-accent/30">
        <Icon name="CheckCircle" size={18} className="text-accent" />
        <AlertDescription>
          <strong className="text-accent">Успешно!</strong> Access Token получен
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Access Token (ACCESS_TOKEN)</Label>
          <div className="flex gap-2">
            <Input
              value={accessToken}
              readOnly
              className="font-mono text-xs"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => onCopyToClipboard(accessToken)}
            >
              <Icon name="Copy" size={16} />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Refresh Token (AMOCRM_REFRESH_TOKEN)</Label>
          <div className="flex gap-2">
            <Input
              value={refreshToken}
              readOnly
              className="font-mono text-xs"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => onCopyToClipboard(refreshToken)}
            >
              <Icon name="Copy" size={16} />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Используется для автоматического обновления токена
          </p>
        </div>

        <div className="space-y-2">
          <Label>Домен AmoCRM (AMOCRM_DOMAIN)</Label>
          <div className="flex gap-2">
            <Input
              value={`${subdomain}.amocrm.ru`}
              readOnly
              className="font-mono text-xs"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => onCopyToClipboard(`${subdomain}.amocrm.ru`)}
            >
              <Icon name="Copy" size={16} />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Client ID (AMOCRM_CLIENT_ID)</Label>
          <div className="flex gap-2">
            <Input
              value={clientId}
              readOnly
              className="font-mono text-xs"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => onCopyToClipboard(clientId)}
            >
              <Icon name="Copy" size={16} />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Client Secret (AMOCRM_CLIENT_SECRET)</Label>
          <div className="flex gap-2">
            <Input
              value={clientSecret}
              readOnly
              className="font-mono text-xs"
              type="password"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => onCopyToClipboard(clientSecret)}
            >
              <Icon name="Copy" size={16} />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Redirect URI (AMOCRM_REDIRECT_URI)</Label>
          <div className="flex gap-2">
            <Input
              value={redirectUri}
              readOnly
              className="font-mono text-xs"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => onCopyToClipboard(redirectUri)}
            >
              <Icon name="Copy" size={16} />
            </Button>
          </div>
        </div>

        <Alert>
          <Icon name="Info" size={18} />
          <AlertDescription>
            <strong>Следующий шаг:</strong>
            <ol className="list-decimal ml-4 mt-2 space-y-1 text-sm">
              <li>Откройте <strong>Настройки → Секреты проекта</strong></li>
              <li>Скопируйте все значения выше в соответствующие секреты</li>
              <li><strong>ВАЖНО:</strong> Добавьте все 6 секретов для автообновления токена</li>
              <li>Сохраните изменения</li>
            </ol>
          </AlertDescription>
        </Alert>

        <Button
          onClick={() => window.location.href = '/'}
          className="w-full bg-gradient-to-r from-primary to-secondary"
        >
          <Icon name="Home" size={20} className="mr-2" />
          Перейти в личный кабинет
        </Button>
      </div>
    </div>
  );
};

export default TokensDisplay;
