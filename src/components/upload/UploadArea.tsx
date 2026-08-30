import React, { useRef, useState } from 'react';
import { UploadIcon, PhotoIcon, VideoIcon, FileIcon, ZipIcon } from '../../assets/icons/Icons';

interface UploadAreaProps {
  onFilesSelected: (files: File[]) => void;
  isLoading?: boolean;
  onOpenPickerSheet?: () => void;
}

export const UploadArea: React.FC<UploadAreaProps> = ({
  onFilesSelected,
  isLoading = false,
  onOpenPickerSheet
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(Array.from(e.target.files));
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => {
        if (onOpenPickerSheet) {
          onOpenPickerSheet();
        } else if (fileInputRef.current) {
          fileInputRef.current.click();
        }
      }}
      style={{
        border: isDragOver ? '2px dashed #111111' : '1.5px dashed var(--border-default)',
        backgroundColor: isDragOver ? 'var(--bg-surface-subtle)' : '#FFFFFF',
        borderRadius: 'var(--radius-xl)',
        padding: '36px 20px',
        textAlign: 'center',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
        transition: 'all 0.15s ease',
        boxShadow: 'var(--shadow-card)'
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleChange}
        style={{ display: 'none' }}
        accept="image/*,video/*,.pdf,.docx,.doc,.zip,.rar,.tar,.gz,audio/*"
      />

      <div
        style={{
          width: 58,
          height: 58,
          borderRadius: 'var(--radius-full)',
          backgroundColor: '#111111',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 6px 18px rgba(0,0,0,0.12)'
        }}
      >
        <UploadIcon size={26} />
      </div>

      <div>
        <div style={{ fontSize: 16, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
          {isDragOver ? 'DROP FILES TO UPLOAD' : 'TAP OR DROP FILES TO UPLOAD'}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
          Photos, 4K Videos, Documents, ZIPs & Digital Downloads
        </div>
      </div>

      {/* Format pills */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', marginTop: 4 }}>
        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--bg-surface-subtle)', color: 'var(--text-secondary)' }}>
          JPG / PNG
        </span>
        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--bg-surface-subtle)', color: 'var(--text-secondary)' }}>
          MP4 / MOV
        </span>
        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--bg-surface-subtle)', color: 'var(--text-secondary)' }}>
          PDF / DOCS
        </span>
        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--bg-surface-subtle)', color: 'var(--text-secondary)' }}>
          ZIP ARCHIVES
        </span>
      </div>
    </div>
  );
};
