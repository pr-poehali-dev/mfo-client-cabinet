import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Document } from './types';

interface DocumentsTabProps {
  documents: Document[];
}

const DocumentsTab = ({ documents }: DocumentsTabProps) => {
  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'FileText';
    if (['doc', 'docx'].includes(ext || '')) return 'FileType';
    if (['jpg', 'jpeg', 'png'].includes(ext || '')) return 'Image';
    return 'File';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Б';
    const k = 1024;
    const sizes = ['Б', 'КБ', 'МБ', 'ГБ'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'contract': return 'Договор';
      case 'agreement': return 'Соглашение';
      default: return 'Документ';
    }
  };

  const getDocumentTypeColor = (type: string) => {
    switch (type) {
      case 'contract': return 'from-primary/20 to-secondary/20 border-primary/30';
      case 'agreement': return 'from-green-500/20 to-blue-500/20 border-green-500/30';
      default: return 'from-muted/20 to-muted/30 border-border/30';
    }
  };

  const extractFileParams = (url: string) => {
    const match = url.match(/files\/([^\/]+)\/versions\/([^\/]+)/);
    if (match) {
      return { file_uuid: match[1], version_uuid: match[2] };
    }
    return null;
  };

  const handleDownloadDocument = async (doc: Document) => {
    const params = extractFileParams(doc.file_url);
    if (!params) {
      console.error('Invalid file URL format');
      return;
    }

    const downloadUrl = `https://functions.poehali.dev/6e80b3d4-1759-415b-bd93-5e37f93088a5?file_uuid=${params.file_uuid}&version_uuid=${params.version_uuid}&filename=${encodeURIComponent(doc.file_name)}`;
    
    try {
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error('Download failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const handleOpenDocument = (doc: Document) => {
    handleDownloadDocument(doc);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold font-montserrat mb-2">Документы и договоры</h2>
        <p className="text-sm text-muted-foreground">
          Все ваши документы, загруженные в AmoCRM
        </p>
      </div>

      {documents.length === 0 ? (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/30 flex items-center justify-center">
              <Icon name="FolderOpen" size={32} className="text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Нет документов</h3>
            <p className="text-muted-foreground">
              Ваши документы будут отображаться здесь
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {documents.map((doc) => (
            <Card 
              key={doc.id} 
              className="border-border/30 bg-card/80 backdrop-blur-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <CardHeader className="relative pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${getDocumentTypeColor(doc.type)} border-2 shrink-0`}>
                      <Icon name={getFileIcon(doc.file_name)} size={28} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg mb-1 truncate">{doc.name}</CardTitle>
                      <p className="text-sm text-muted-foreground truncate">{doc.file_name}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Icon name="HardDrive" size={12} />
                          {formatFileSize(doc.file_size)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Icon name="Calendar" size={12} />
                          {doc.uploaded_at}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full bg-gradient-to-r ${getDocumentTypeColor(doc.type)} text-xs font-semibold`}>
                          {getDocumentTypeLabel(doc.type)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="relative pt-0">
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleOpenDocument(doc)}
                    className="flex-1 bg-gradient-to-r from-primary to-secondary"
                  >
                    <Icon name="Download" size={16} className="mr-2" />
                    Скачать документ
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <div className="flex items-start gap-3">
          <Icon name="Info" size={18} className="text-primary mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold mb-1">Информация о документах</p>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Документы загружаются автоматически из AmoCRM. Если вы не видите нужный документ, 
              обратитесь к менеджеру для загрузки файла в систему.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentsTab;