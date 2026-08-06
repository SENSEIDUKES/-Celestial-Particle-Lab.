import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Layers, Upload } from 'lucide-react';
import type { StorySeedArtifact } from '../shared/storySeedRepository';
import { parseStorySeedJson } from '../shared/storySeedSerialization';

interface ImportPanelProps {
  show: boolean;
  onClose: () => void;
  onImport: (artifacts: StorySeedArtifact[]) => Promise<void>;
}

export const ImportPanel = ({ show, onClose, onImport }: ImportPanelProps) => {
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const completeImport = async (artifacts: StorySeedArtifact[]) => {
    setIsImporting(true);
    setImportError(null);
    try {
      await onImport(artifacts);
      setImportText('');
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'The seed could not be added to your account.');
    } finally {
      setIsImporting(false);
    }
  };

  const importJson = async (json: string, fallbackMessage: string) => {
    try {
      await completeImport(parseStorySeedJson(json));
    } catch (error) {
      setImportError(error instanceof Error ? error.message : fallbackMessage);
    }
  };

  const handleImportSubmit = async () => {
    if (!importText.trim()) {
      setImportError('Please paste Story Seed JSON first.');
      return;
    }
    await importJson(importText, 'The pasted Story Seed JSON is invalid.');
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    await importJson(await file.text(), 'The selected Story Seed file is invalid.');
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-8 p-6 rounded-lg bg-neutral-950 border border-portal/30 space-y-4 max-w-2xl mx-auto shadow-[0_0_25px_rgba(4,172,255,0.08)] overflow-hidden"
        >
          <div className="flex justify-between items-center pb-2 border-b border-neutral-900">
            <h3 className="font-sc font-bold uppercase tracking-widest text-[#FAFAFA] text-xs flex items-center space-x-2">
              <Layers size={14} className="text-portal" />
              <span>Import Story Seed</span>
            </h3>
            <button
              type="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  event.currentTarget.click();
                }
              }}
              onClick={onClose}
              className="text-neutral-500 hover:text-[#FAFAFA] text-xs"
            >
              Close
            </button>
          </div>

          <p className="text-neutral-400 font-sans text-xs leading-relaxed">
            Import portable Story Seed JSON. A reviewed World Blueprint is restored when present; older seed-only files remain supported.
          </p>

          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-portal/40 bg-portal/5 px-4 py-3 font-sc text-[10px] font-bold uppercase tracking-widest text-portal transition-colors hover:border-portal hover:bg-portal/10">
            <Upload size={14} />
            Choose Story Seed JSON
            <input
              type="file"
              accept="application/json,.json"
              onChange={handleFileImport}
              disabled={isImporting}
              className="sr-only"
            />
          </label>

          <textarea
            value={importText}
            onChange={(event) => {
              setImportText(event.target.value);
              setImportError(null);
            }}
            rows={6}
            placeholder="Paste portable Story Seed JSON here..."
            className="w-full bg-void border border-neutral-900 focus:border-portal text-neutral-300 font-sans text-xs rounded-md p-3 focus:outline-none focus:ring-1 focus:ring-portal/20 transition-all"
          />

          {importError && (
            <p className="text-xs text-human font-sans font-medium">{importError}</p>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  event.currentTarget.click();
                }
              }}
              onClick={handleImportSubmit}
              disabled={isImporting}
              className="font-sc px-5 py-2 rounded text-xs uppercase tracking-widest font-bold bg-human text-[#FAFAFA] hover:bg-neutral-900 hover:text-human border border-human transition-colors cursor-pointer"
            >
              {isImporting ? 'Saving Seed…' : 'Activate Seed'}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
