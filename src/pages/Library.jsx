import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const STATUS_FILTERS = ['All', 'Achieved', 'Working On', 'Want To Try'];

export default function Library() {
  const { moves } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filtered = moves.filter((move) => {
    const query = search.toLowerCase();
    const matchesSearch =
      move.name.toLowerCase().includes(query) ||
      (move.aliases || []).some((alias) => alias.toLowerCase().includes(query));
    const matchesStatus =
      statusFilter === 'All' ||
      move.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <input
        type="text"
        placeholder="Search moves..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div>
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            disabled={statusFilter === s}
          >
            {s}
          </button>
        ))}
      </div>

      <p>{filtered.length} move{filtered.length !== 1 ? 's' : ''} showing</p>

      <ul>
        {filtered.map((move) => (
          <li key={move.id} onClick={() => navigate(`/move/${move.id}`)} style={{ cursor: 'pointer' }}>
            <strong>{move.name}</strong> — {move.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
