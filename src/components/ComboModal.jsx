import { ChevronLeft, Trash2, Plus } from 'lucide-react';
import { useApp } from '../hooks/useApp';
import { useComboEditor } from '../hooks/useComboEditor';
import { BottomSheet, IconButton, Button } from './ui';
import ComboEditorPanels from './ComboEditorPanels';

export default function ComboModal({ isOpen, onClose }) {
  const { moves, createCombo } = useApp();
  const editor = useComboEditor(moves);

  function resetAndClose() {
    editor.resetToEmpty();
    onClose();
  }

  async function handleCreate() {
    const { error } = await createCombo(
      editor.comboName.trim(),
      editor.moveIds,
      editor.notes.trim()
    );

    if (error) {
      console.error('Failed to save combo:', error);
      return;
    }

    resetAndClose();
  }

  const addBtnLabel = editor.pendingIds.length === 0
    ? 'Add moves'
    : `Add ${editor.pendingIds.length} move${editor.pendingIds.length !== 1 ? 's' : ''}`;

  const bottomAction = editor.isAddPanel
    ? (
      <Button
        fullWidth
        leftIcon={<Plus size={16} />}
        onClick={editor.confirmAddMoves}
        disabled={editor.pendingIds.length === 0}
        data-testid="combo-add-moves-submit"
      >
        {addBtnLabel}
      </Button>
    )
    : editor.moveIds.length > 0
      ? <Button fullWidth onClick={handleCreate} data-testid="combo-create-submit">Create combo</Button>
      : null;

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={resetAndClose}
      title={editor.isAddPanel ? 'Add moves' : 'New combo'}
      leftAction={
        <IconButton
          icon={<ChevronLeft size={20} />}
          label={editor.isAddPanel ? 'Back' : 'Close'}
          onClick={editor.isAddPanel ? editor.closeAddMoves : resetAndClose}
          data-testid={editor.isAddPanel ? 'combo-add-back' : 'combo-close'}
        />
      }
      rightAction={
        !editor.isAddPanel ? (
          <IconButton
            icon={<Trash2 size={18} />}
            label="Discard combo"
            onClick={resetAndClose}
            data-testid="combo-discard"
          />
        ) : undefined
      }
      bottomAction={bottomAction}
    >
      <ComboEditorPanels editor={editor} mode="create" />
    </BottomSheet>
  );
}
