import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Plus } from 'lucide-react';
import { useApp } from '../hooks/useApp';
import { useComboEditor } from '../hooks/useComboEditor';
import ComboEditorPanels from '../components/ComboEditorPanels';
import { Button, PageHeader, PageState } from '../components/ui';
import styles from './ComboEdit.module.css';

export default function ComboEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { combos, moves, loading, updateCombo } = useApp();

  const combo = combos.find((item) => String(item.id) === id);
  const editor = useComboEditor(moves);
  const [hydratedComboId, setHydratedComboId] = useState(null);

  useEffect(() => {
    if (!combo) return;
    if (hydratedComboId === combo.id) return;
    editor.setDraft({
      name: combo.name || '',
      moveIds: combo.move_ids || [],
      notes: combo.notes || '',
    });
    setHydratedComboId(combo.id);
  }, [combo, hydratedComboId, editor]);

  async function handleSave() {
    if (!combo || editor.moveIds.length === 0) return;
    const result = await updateCombo(combo.id, {
      name: editor.comboName.trim() || null,
      move_ids: editor.moveIds,
      notes: editor.notes.trim() || null,
    });
    if (result.ok) navigate(`/combos/${combo.id}`);
  }

  if (loading) return <PageState text="Loading..." className={styles.stateText} />;
  if (!combo) return <PageState text="Combo not found." className={styles.stateText} />;

  const addBtnLabel = editor.pendingIds.length === 0
    ? 'Add moves'
    : `Add ${editor.pendingIds.length} move${editor.pendingIds.length !== 1 ? 's' : ''}`;

  return (
    <div className={styles.page}>
      <PageHeader
        title={editor.isAddPanel ? 'Add moves' : 'Edit combo'}
        leftAction={
          editor.isAddPanel ? (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<ChevronLeft size={16} />}
              onClick={editor.closeAddMoves}
              className={styles.headerButton}
            >
              Back
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<ChevronLeft size={16} />}
              onClick={() => navigate(`/combos/${combo.id}`)}
              className={styles.headerButton}
            >
              Cancel
            </Button>
          )
        }
        rightAction={
          !editor.isAddPanel ? (
            <Button
              size="sm"
              onClick={handleSave}
              disabled={editor.moveIds.length === 0}
              className={styles.saveButton}
            >
              Save
            </Button>
          ) : null
        }
        noBorder
        className={styles.header}
      />

      <ComboEditorPanels editor={editor} mode="edit" />

      {editor.isAddPanel && (
        <div className={styles.bottomAction}>
          <Button
            fullWidth
            leftIcon={<Plus size={16} />}
            onClick={editor.confirmAddMoves}
            disabled={editor.pendingIds.length === 0}
          >
            {addBtnLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
