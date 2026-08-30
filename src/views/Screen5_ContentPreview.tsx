import React, { useState } from 'react';
import { useProducts } from '../context/ProductContext';
import { useNavigation } from '../context/NavigationContext';
import { useToast } from '../context/ToastContext';
import { storageService } from '../services/storageService';
import { ContentGrid } from '../components/media/ContentGrid';
import { VideoPlayer } from '../components/media/VideoPlayer';
import { Button } from '../components/common/Button';
import { ArrowRightIcon, PlusIcon } from '../assets/icons/Icons';
import { ProductFile } from '../types';

export const Screen5_ContentPreview: React.FC = () => {
  const { draft, updateDraft, removeDraftFile, addDraftFiles } = useProducts();
  const { navigateTo } = useNavigation();
  const { showToast } = useToast();
  const [selectedVideo, setSelectedVideo] = useState<ProductFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSelectCover = (file: ProductFile) => {
    updateDraft({
      coverImage: file.blobDataUrl || file.previewPath || file.storagePath,
      previewBlurUrl: file.previewPath
    });
    showToast('Cover updated', file.name, 'success');
  };

  const handleAddMore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsProcessing(true);
      const files = Array.from(e.target.files);
      const processed: ProductFile[] = [];

      for (let i = 0; i < files.length; i++) {
        const item = await storageService.processUpload(
          files[i],
          'draft',
          draft.files.length + i + 1
        );
        processed.push(item);
      }

      addDraftFiles(processed);
      setIsProcessing(false);
      showToast(`${processed.length} more file(s) attached`, undefined, 'success');
    }
  };

  return (
    <div className="app-content no-bottom-nav">
      <div className="p-page" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <span className="text-label">STEP 2 OF 5</span>
          <h1 className="text-headline" style={{ marginTop: 2 }}>
            ORGANIZED MEDIA.
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>
            Review your files. Choose which visual represents your cover drop.
          </p>
        </div>

        {/* Video Player Modal if tapped */}
        {selectedVideo && (
          <div style={{ marginBottom: 12 }}>
            <VideoPlayer
              src={selectedVideo.blobDataUrl || selectedVideo.storagePath}
              poster={selectedVideo.previewPath}
              title={selectedVideo.name}
              onClose={() => setSelectedVideo(null)}
            />
          </div>
        )}

        {/* Media Grid */}
        <ContentGrid
          files={draft.files}
          coverId={draft.files.find((f) => f.blobDataUrl === draft.coverImage || f.previewPath === draft.coverImage || f.storagePath === draft.coverImage)?.id}
          onRemoveFile={(id) => removeDraftFile(id)}
          onSelectCover={handleSelectCover}
          onPlayVideo={(file) => setSelectedVideo(file)}
          showControls={true}
        />

        {/* Add more button */}
        <div style={{ marginTop: 4 }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              border: '1.5px dashed var(--border-default)',
              backgroundColor: '#FFFFFF',
              cursor: isProcessing ? 'wait' : 'pointer',
              fontWeight: 700,
              fontSize: 13,
              textTransform: 'uppercase',
              opacity: isProcessing ? 0.6 : 1
            }}
          >
            <PlusIcon size={16} />
            <span>{isProcessing ? 'PROCESSING FILES...' : 'ADD MORE FILES'}</span>
            <input
              type="file"
              multiple
              disabled={isProcessing}
              onChange={handleAddMore}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>

      {/* Sticky Bottom Action */}
      <div className="sticky-bottom-bar">
        <Button
          variant="primary"
          onClick={() => navigateTo('create_step3')}
          rightIcon={<ArrowRightIcon size={18} />}
        >
          CONTINUE TO ACCESS SETTINGS
        </Button>
      </div>
    </div>
  );
};
