import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface DeletePlantModalProps {
  isOpen: boolean;
  onClose: () => void;
  plantName: string;
  onConfirmDelete: () => void;
}

export const DeletePlantModal: React.FC<DeletePlantModalProps> = ({
  isOpen,
  onClose,
  plantName,
  onConfirmDelete
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 neo-modal">
      <div className="neo-card-rose rounded-2xl w-full max-w-md text-slate-100 shadow-2xl overflow-hidden p-6 lg:p-7 animate-in fade-in zoom-in-95 duration-200 space-y-4">
        
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl neo-badge text-rose-400">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Remove Plant Specimen?</h3>
            <p className="text-xs text-slate-400">This action cannot be undone.</p>
          </div>
        </div>

        <p className="text-xs lg:text-sm text-slate-300 leading-relaxed">
          Are you sure you want to remove <strong className="text-rose-300 font-bold">{plantName}</strong> from your garden database? All historical care logs and passport metrics will be deleted.
        </p>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800/80">
          <button
            onClick={onClose}
            className="neo-btn px-4 py-2.5 rounded-xl text-xs font-bold text-slate-300"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirmDelete();
              onClose();
            }}
            className="neo-btn-rose px-5 py-2.5 rounded-2xl text-xs font-bold"
          >
            Confirm Delete
          </button>
        </div>

      </div>
    </div>
  );
};
