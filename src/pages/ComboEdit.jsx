import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useApp } from '../hooks/useApp';
import { useComboEditor } from '../hooks/useComboEditor';
import ComboEditorPanels from '../components/ComboEditorPanels';
import { Button } from '../components/ui';
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
    const { error } = await updateCombo(combo.id, {
      name: editor.comboName.trim() || null,
      move_ids: editor.moveIds,
      notes: editor.notes.trim() || null,
    });
    if (!error) navigate(`/combos/${combo.id}`);
  }

  if (loading) return <p className={styles.stateText}>Loading...</p>;
  if (!combo) return <p className={styles.stateText}>Combo not found.</p>;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<ChevronLeft size={16} />}
          onClick={() => navigate(`/combos/${combo.id}`)}
          className={styles.headerButton}
        >
          Cancel
        </Button>
        <h1 className={styles.headerTitle}>Edit combo</h1>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={editor.moveIds.length === 0}
          className={styles.saveButton}
        >
          Save
        </Button>
      </div>

      <ComboEditorPanels editor={editor} mode="edit" showInlineAddButton={editor.isAddPanel} />
    </div>
  );
}
