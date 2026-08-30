import React from 'react';
import { ProductFile } from '../../types';
import { PhotoIcon, VideoIcon, FileIcon, ZipIcon, AudioIcon, TrashIcon, PlayIcon } from '../../assets/icons/Icons';
import { IconButton } from '../common/IconButton';

interface ContentThumbnailProps {
  file: ProductFile;
  onRemove?: () => void;
  onSelectCover?: () => void;
  isCover?: boolean;
  showControls?: boolean;
  onPlayClick?: () => void;
}

export const ContentThumbnail: React.FC<ContentThumbnailProps> = ({
  file,
  onRemove,
  onSelectCover,
  isCover = false,
  showControls = true,
  onPlayClick
}) => {
  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getCategoryIcon = () => {
    switch (file.fileType) {
      case 'photo': return <PhotoIcon size={18} />;
      case 'video': return <VideoIcon size={18} />;
      case 'document': return <FileIcon size={18} />;
      case 'archive': return <ZipIcon size={18} />;
      case 'audio': return <AudioIcon size={18} />;
      default: return <FileIcon size={18} />;
    }
  };

  const previewSrc = file.blobDataUrl || file.previewPath || file.storagePath;

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: 'var(--radius-md)',
        border: isCover ? '2px solid #111111' : '1px solid var(--border-default)',
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-card)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Media Aspect Container */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16 / 10',
          backgroundColor: '#1E1E1E',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {file.fileType === 'photo' && (
          <img
            src={previewSrc}
            alt={file.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}

        {file.fileType === 'video' && (
          <div
            onClick={onPlayClick}
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: onPlayClick ? 'pointer' : 'default',
              backgroundImage: file.previewPath ? `url(${file.previewPath})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(17, 17, 17, 0.8)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(8px)'
              }}
            >
              <PlayIcon size={20} />
            </div>
            {file.duration && (
              <span
                style={{
                  position: 'absolute',
                  bottom: 8,
                  right: 8,
                  backgroundColor: 'rgba(0, 0, 0, 0.75)',
                  color: '#FFFFFF',
                  padding: '2px 6px',
                  borderRadius: 4,
                  fontSize: 10.5,
                  fontWeight: 700
                }}
              >
                {file.duration}
              </span>
            )}
          </div>
        )}

        {(file.fileType === 'document' || file.fileType === 'archive' || file.fileType === 'audio') && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#A3A3A3',
              gap: 8
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#2A2A2A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF'
              }}
            >
              {getCategoryIcon()}
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              {file.fileType}
            </span>
          </div>
        )}

        {/* Cover badge */}
        {isCover && (
          <span
            style={{
              position: 'absolute',
              top: 8,
              left: 8,
              backgroundColor: '#111111',
              color: '#FFFFFF',
              padding: '3px 8px',
              borderRadius: 4,
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '0.04em',
              textTransform: 'uppercase'
            }}
          >
            COVER
          </span>
        )}

        {/* Remove button */}
        {showControls && onRemove && (
          <div style={{ position: 'absolute', top: 6, right: 6 }}>
            <IconButton
              variant="dark"
              size={28}
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
            >
              <TrashIcon size={14} />
            </IconButton>
          </div>
        )}
      </div>

      {/* File Info */}
      <div style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ overflow: 'hidden' }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {file.name}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
            {formatSize(file.fileSize)}
          </div>
        </div>

        {showControls && onSelectCover && !isCover && file.fileType === 'photo' && (
          <button
            type="button"
            onClick={onSelectCover}
            style={{
              padding: '4px 8px',
              fontSize: 10.5,
              fontWeight: 700,
              border: '1px solid var(--border-default)',
              backgroundColor: 'transparent',
              borderRadius: 'var(--radius-xs)',
              cursor: 'pointer',
              textTransform: 'uppercase'
            }}
          >
            Set Cover
          </button>
        )}
      </div>
    </div>
  );
};
