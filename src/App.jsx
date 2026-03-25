import { Routes, Route } from 'react-router-dom';
import Library from './pages/Library';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Library />} />
    </Routes>
  );
}

export default App;
