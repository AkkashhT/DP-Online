import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import UploadPage from './pages/UploadPage';
import ResultsPage from './pages/ResultsPage';
import ChatPage from './pages/ChatPage';
import HistoryPage from './pages/HistoryPage';

function App() {
  const [activePage, setActivePage] = useState('upload');
  const [documentData, setDocumentData] = useState(null);

  const handleUploadSuccess = (data) => {
    setDocumentData(data);
    setActivePage('results');
  };

  const handleLoadFromHistory = (data) => {
    setDocumentData(data);
    setActivePage('results');
  };

  const renderPage = () => {
    switch (activePage) {
      case 'upload':   return <UploadPage onSuccess={handleUploadSuccess} />;
      case 'results':  return <ResultsPage documentData={documentData} onUploadNew={() => setActivePage('upload')} />;
      case 'chat':     return <ChatPage documentData={documentData} onUploadNew={() => setActivePage('upload')} />;
      case 'history':  return <HistoryPage onLoadDocument={handleLoadFromHistory} onUploadNew={() => setActivePage('upload')} />;
      default:         return <UploadPage onSuccess={handleUploadSuccess} />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar activePage={activePage} onNavigate={setActivePage} documentData={documentData} />
      <div className="main-content">{renderPage()}</div>
    </div>
  );
}

export default App;
