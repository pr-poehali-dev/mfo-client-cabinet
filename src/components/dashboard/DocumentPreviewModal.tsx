import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DocumentPreviewModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  content: React.ReactNode;
  onDownload?: () => void;
  documentId?: string;
}

const DocumentPreviewModal = ({ open, onClose, title, content, onDownload, documentId }: DocumentPreviewModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{title}</span>
            <div className="flex gap-2">
              {onDownload && (
                <Button onClick={onDownload} size="sm" variant="outline">
                  <Icon name="Download" size={16} className="mr-2" />
                  Скачать PDF
                </Button>
              )}
              <Button onClick={onClose} size="sm" variant="ghost">
                <Icon name="X" size={16} />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 pr-4">
          <div id={documentId} className="prose prose-sm max-w-none">
            {content}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentPreviewModal;