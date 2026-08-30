import React, { useState } from 'react';
import { useProducts } from '../context/ProductContext';
import { useNavigation } from '../context/NavigationContext';
import { useToast } from '../context/ToastContext';
import { downloadService } from '../services/downloadService';
import { VideoPlayer } from '../components/media/VideoPlayer';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { DownloadIcon, UnlockIcon, VideoIcon, FileIcon, ZipIcon } from '../assets/icons/Icons';
import { ProductFile } from '../types';

export const Screen15_UnlockedContent: React.FC = () => {
  const { products } = useProducts();
  const { activeProductId, navigateTo } = useNavigation();
  const { showToast } = useToast();

  const [activePhoto, setActivePhoto] = useState<ProductFile | null>(null);
  const [activeVideo, setActiveVideo] = useState<ProductFile | null>(null);
  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);

  const product = products.find((p) => p.id === activeProductId);

  const handleDownloadFile = async (file: ProductFile) => {
    if (!product) return;
    showToast('Starting file download...', file.name, 'info');
    await downloadService.downloadSingleFile(file, product.title);
  };

  const handleDownloadAll = async () => {
    if (!product) return;
    setIsZipping(true);
    showToast('Generating uncompressed ZIP archive...', undefined, 'info');
    await downloadService.downloadAllAsZip(product, (pct) => setZipProgress(pct));
    setIsZipping(false);
    showToast('Download ready!', `${product.title}.zip`, 'success');
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (!product) {
    return (
      <div className="app-content p-page" style={{ justifyContent: 'center' }}>
        <div className="surface-card" style={{ padding: '32px 20px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, textTransform: 'uppercase', marginBottom: 8 }}>
            VAULT CONTENT NOT AVAILABLE
          </h2>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginBottom: 20 }}>
            This drop could not be found or has not yet been unlocked.
          </p>
          <Button variant="primary" onClick={() => navigateTo('home')}>
            GO TO HOME
          </Button>
        </div>
      </div>
    );
  }

  const photoFiles = product.files.filter((f) => f.fileType === 'photo');
  const videoFiles = product.files.filter((f) => f.fileType === 'video');
  const otherFiles = product.files.filter((f) => f.fileType !== 'photo' && f.fileType !== 'video');

  return (
    <div className="app-content p-page" style={{ paddingBottom: 100 }}>
      {/* Header Info */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#059669', marginBottom: 4 }}>
          <UnlockIcon size={16} strokeWidth={2.4} />
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            PRIVATE AUTHORIZED ACCESS
          </span>
        </div>

        <h1 className="text-headline">
          {product.title}
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
          <span>By {product.creatorName}</span>
          <span>•</span>
          <span>{product.files.length} Assets Available</span>
        </div>
      </div>

      {/* Master Download Action */}
      <div style={{ marginBottom: 24 }}>
        <Button
          variant="primary"
          isLoading={isZipping}
          onClick={handleDownloadAll}
          leftIcon={<DownloadIcon size={18} />}
        >
          {isZipping ? `PACKAGING FULL ZIP (${zipProgress}%)...` : 'DOWNLOAD ALL AS ZIP'}
        </Button>
      </div>

      {/* Active Video Player */}
      {activeVideo && (
        <div style={{ marginBottom: 24 }}>
          <VideoPlayer
            src={activeVideo.blobDataUrl || activeVideo.storagePath}
            poster={activeVideo.previewPath}
            title={activeVideo.name}
            onClose={() => setActiveVideo(null)}
          />
        </div>
      )}

      {/* Video Section */}
      {videoFiles.length > 0 && !activeVideo && (
        <div style={{ marginBottom: 24 }}>
          <div className="text-label" style={{ marginBottom: 10 }}>VIDEO REELS & MASTERCLASSES</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {videoFiles.map((file) => (
              <div
                key={file.id}
                className="surface-card surface-card-interactive"
                onClick={() => setActiveVideo(file)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '12px 14px'
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#111111',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <VideoIcon size={22} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 800, textTransform: 'uppercase', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {file.name}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                    {formatSize(file.fileSize)} {file.duration ? `• ${file.duration}` : ''}
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: '#111111',
                    color: '#FFFFFF',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 11,
                    fontWeight: 800
                  }}
                >
                  PLAY
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Photo Gallery Grid */}
      {photoFiles.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div className="text-label" style={{ marginBottom: 10 }}>HIGH RESOLUTION PHOTO GALLERY</div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 10
            }}
          >
            {photoFiles.map((file) => (
              <div
                key={file.id}
                onClick={() => setActivePhoto(file)}
                style={{
                  position: 'relative',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  aspectRatio: '1 / 1',
                  backgroundColor: '#1E1E1E',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-card)'
                }}
              >
                <img
                  src={file.blobDataUrl || file.storagePath}
                  alt={file.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  loading="lazy"
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '6px 8px',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)',
                    color: '#FFFFFF',
                    fontSize: 11,
                    fontWeight: 600,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {file.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documents & Downloadable Files */}
      {otherFiles.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div className="text-label" style={{ marginBottom: 10 }}>DOWNLOADABLE ASSETS & DOCUMENTS</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {otherFiles.map((file) => (
              <div
                key={file.id}
                className="surface-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-surface-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#111111',
                      flexShrink: 0
                    }}
                  >
                    {file.fileType === 'archive' ? <ZipIcon size={20} /> : <FileIcon size={20} />}
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 800, textTransform: 'uppercase', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {file.name}
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 2 }}>
                      {formatSize(file.fileSize)}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDownloadFile(file)}
                  style={{
                    backgroundColor: '#111111',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    padding: '8px 12px',
                    fontSize: 11.5,
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    flexShrink: 0
                  }}
                >
                  <DownloadIcon size={14} />
                  <span>GET</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox Modal for Photos */}
      <Modal
        isOpen={!!activePhoto}
        onClose={() => setActivePhoto(null)}
        title={activePhoto?.name || 'PHOTO VIEWER'}
      >
        {activePhoto && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', backgroundColor: '#000000', maxHeight: '60vh' }}>
              <img
                src={activePhoto.blobDataUrl || activePhoto.storagePath}
                alt={activePhoto.name}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                {formatSize(activePhoto.fileSize)}
              </span>

              <Button
                variant="primary"
                onClick={() => handleDownloadFile(activePhoto)}
                leftIcon={<DownloadIcon size={16} />}
                style={{ width: 'auto', padding: '10px 18px' }}
              >
                DOWNLOAD HIGH-RES
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
