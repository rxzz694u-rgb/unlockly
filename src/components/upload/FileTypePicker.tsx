import React, { useRef } from 'react';
import { BottomSheet } from '../common/BottomSheet';
import { PhotoIcon, VideoIcon, FileIcon, ZipIcon, AudioIcon } from '../../assets/icons/Icons';

interface FileTypePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (accept: string) => void;
}

export const FileTypePicker: React.FC<FileTypePickerProps> = ({
  isOpen,
  onClose,
  onSelectType
}) => {
  const options = [
    {
      id: 'photo',
      label: 'PHOTOS & HIGH-RES IMAGES',
      sublabel: 'JPG, PNG, RAW, WebP',
      icon: <PhotoIcon size={22} />,
      accept: 'image/*'
    },
    {
      id: 'video',
      label: '4K VIDEOS & REELS',
      sublabel: 'MP4, MOV, ProRes, WebM',
      icon: <VideoIcon size={22} />,
      accept: 'video/*'
    },
    {
      id: 'document',
      label: 'DOCUMENTS & GUIDES',
      sublabel: 'PDF, DOCX, TXT, Keynote',
      icon: <FileIcon size={22} />,
      accept: '.pdf,.docx,.doc,.txt,.epub'
    },
    {
      id: 'archive',
      label: 'ZIP & DIGITAL TOOLKITS',
      sublabel: 'ZIP, RAR, 7Z, Presets, Assets',
      icon: <ZipIcon size={22} />,
      accept: '.zip,.rar,.7z,.tar,.gz'
    },
    {
      id: 'audio',
      label: 'AUDIO & SOUND PACKS',
      sublabel: 'MP3, WAV, FLAC, Samples',
      icon: <AudioIcon size={22} />,
      accept: 'audio/*'
    }
  ];

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="WHAT ARE YOU SHARING?">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {options.map((opt) => (
          <div
            key={opt.id}
            onClick={() => {
              onClose();
              onSelectType(opt.accept);
            }}
            className="surface-card surface-card-interactive"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '14px 16px'
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
              {opt.icon}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.01em' }}>
                {opt.label}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                {opt.sublabel}
              </div>
            </div>
          </div>
        ))}
      </div>
    </BottomSheet>
  );
};
