import React from 'react';
import { ProductFile } from '../../types';
import { ContentThumbnail } from './ContentThumbnail';

interface ContentGridProps {
  files: ProductFile[];
  coverId?: string;
  onRemoveFile?: (fileId: string) => void;
  onSelectCover?: (file: ProductFile) => void;
  showControls?: boolean;
  onPlayVideo?: (file: ProductFile) => void;
}

export const ContentGrid: React.FC<ContentGridProps> = ({
  files,
  coverId,
  onRemoveFile,
  onSelectCover,
  showControls = true,
  onPlayVideo
}) => {
  if (files.length === 0) return null;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: 12,
        width: '100%'
      }}
    >
      {files.map((file) => (
        <ContentThumbnail
          key={file.id}
          file={file}
          isCover={coverId ? file.id === coverId : file.order === 1}
          onRemove={onRemoveFile ? () => onRemoveFile(file.id) : undefined}
          onSelectCover={onSelectCover ? () => onSelectCover(file) : undefined}
          showControls={showControls}
          onPlayClick={onPlayVideo ? () => onPlayVideo(file) : undefined}
        />
      ))}
    </div>
  );
};
