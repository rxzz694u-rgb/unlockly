import React, { useState } from 'react';
import { useProducts } from '../context/ProductContext';
import { useNavigation } from '../context/NavigationContext';
import { useToast } from '../context/ToastContext';
import { storageService } from '../services/storageService';
import { UploadArea } from '../components/upload/UploadArea';
import { FileTypePicker } from '../components/upload/FileTypePicker';
import { UploadProgress } from '../components/upload/UploadProgress';
import { Input } from '../components/common/Input';
import { Textarea } from '../components/common/Textarea';
import { Button } from '../components/common/Button';
import { ArrowRightIcon } from '../assets/icons/Icons';
import { ProductFile } from '../types';

export const Screen4_CreateContent: React.FC = () => {
  const { draft, updateDraft, addDraftFiles } = useProducts();
  const { navigateTo } = useNavigation();
  const { showToast } = useToast();

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<{ name: string; progress: number }[]>([]);

  const handleFilesSelected = async (files: File[]) => {
    if (files.length === 0) return;

    // Simulate upload progress
    const newUploading = files.map((f) => ({ name: f.name, progress: 15 }));
    setUploadingFiles(newUploading);

    const processedFiles: ProductFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Progress tick
      setUploadingFiles((prev) =>
        prev.map((item, idx) => (idx === i ? { ...item, progress: 65 } : item))
      );

      const processed = await storageService.processUpload(
        file,
        'draft_product',
        draft.files.length + i + 1
      );
      processedFiles.push(processed);

      setUploadingFiles((prev) =>
        prev.map((item, idx) => (idx === i ? { ...item, progress: 100 } : item))
      );
    }

    setTimeout(() => {
      addDraftFiles(processedFiles);
      setUploadingFiles([]);
      showToast(`${processedFiles.length} ${processedFiles.length === 1 ? 'file' : 'files'} attached`, undefined, 'success');

      // Autofill title if empty
      if (!draft.title && processedFiles[0]) {
        const cleanName = processedFiles[0].name.replace(/\.[^/.]+$/, '').replace(/[_|-]/g, ' ').toUpperCase();
        updateDraft({ title: cleanName });
      }
    }, 400);
  };

  const handleTypeSelected = (accept: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = accept;
    input.onchange = (e: any) => {
      if (e.target?.files) {
        handleFilesSelected(Array.from(e.target.files));
      }
    };
    input.click();
  };

  const canContinue = draft.files.length > 0 && draft.title.trim().length > 0;

  return (
    <div className="app-content no-bottom-nav">
      <div className="p-page" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <span className="text-label">STEP 1 OF 5</span>
          <h1 className="text-headline" style={{ marginTop: 2 }}>
            CREATE SOMETHING.
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>
            What private content do you want to share?
          </p>
        </div>

        {/* Upload Zone */}
        <UploadArea
          onFilesSelected={handleFilesSelected}
          onOpenPickerSheet={() => setIsPickerOpen(true)}
        />

        {/* Active Uploads Indicator */}
        {uploadingFiles.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {uploadingFiles.map((up, idx) => (
              <UploadProgress
                key={idx}
                fileName={up.name}
                progress={up.progress}
                isComplete={up.progress >= 100}
              />
            ))}
          </div>
        )}

        {/* Already Attached Files Counter */}
        {draft.files.length > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              backgroundColor: 'var(--bg-surface-subtle)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-default)'
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase' }}>
              {draft.files.length} {draft.files.length === 1 ? 'FILE ATTACHED' : 'FILES ATTACHED'}
            </span>
            <button
              type="button"
              onClick={() => navigateTo('create_step2')}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#111111',
                fontSize: 12,
                fontWeight: 800,
                cursor: 'pointer',
                textTransform: 'uppercase'
              }}
            >
              VIEW / REORDER →
            </button>
          </div>
        )}

        {/* Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 4 }}>
          <Input
            label="TITLE"
            value={draft.title}
            onChange={(e) => updateDraft({ title: e.target.value })}
            placeholder="e.g. EXCLUSIVE SUMMER PHOTOS"
            helperText="Give your private drop a confident, clear headline."
            required
          />

          <Textarea
            label="DESCRIPTION"
            value={draft.description}
            onChange={(e) => updateDraft({ description: e.target.value })}
            placeholder="Describe what's inside, resolution, camera gear, or exclusivity..."
            helperText="Buyers will read this before deciding to unlock."
          />
        </div>
      </div>

      {/* Sticky Bottom Action */}
      <div className="sticky-bottom-bar">
        <Button
          variant="primary"
          disabled={!canContinue}
          onClick={() => navigateTo('create_step2')}
          rightIcon={<ArrowRightIcon size={18} />}
        >
          CONTINUE TO PREVIEW
        </Button>
      </div>

      {/* Upload Type Picker Bottom Sheet */}
      <FileTypePicker
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelectType={handleTypeSelected}
      />
    </div>
  );
};
