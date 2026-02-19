import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import CodeLab from './pages/CodeLab';
import SandboxRunner from './pages/SandboxRunner';
import FuzzingConsole from './pages/FuzzingConsole';
import SecurityTimeline from './pages/SecurityTimeline';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<CodeLab />} />
          <Route path="/sandbox" element={<SandboxRunner />} />
          <Route path="/fuzzing" element={<FuzzingConsole />} />
          <Route path="/timeline" element={<SecurityTimeline />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
