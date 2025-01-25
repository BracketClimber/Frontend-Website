import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import logo from './assets/images/logo_with_name.png';

function App() {
  const [text, setText] = useState('');
  const [combinedAudioUrl, setCombinedAudioUrl] = useState('');
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setProgress(0);
    setProgressMessage('');
    setError('');
    setCombinedAudioUrl('');

    try {
      const response = await fetch('http://localhost:5000/generate-sounds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Fehler bei der Generierung der Sounds');
      }

      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      setCombinedAudioUrl(audioUrl);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(async () => {
        try {
          const response = await fetch('http://localhost:5000/progress');
          if (!response.ok) {
            throw new Error('Fehler beim Abrufen des Fortschritts');
          }
          const data = await response.json();
          setProgress(data.progress);
          setProgressMessage(data.message);
          if (data.progress >= 100) {
            clearInterval(interval);
          }
        } catch (err) {
          clearInterval(interval);
          console.error(err);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <img src={logo} alt="Logo" style={{ width: '210px', height: '55px', objectFit: 'contain', marginRight: '10px' }} />
        <h1 style={{ margin: 0 }}>Musifyr: KI-generierte Hintergrundmusik</h1>
      </div>

      <form onSubmit={handleSubmit} className="mb-4">
        <div className="form-group">
          <label htmlFor="textInput">Text eingeben:</label>
          <textarea
            id="textInput"
            className="form-control"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Gib einen Text ein..."
            rows="5"
            style={{ backgroundColor: '#ffffff' }}
          />
        </div>
        <button type="submit" className="btn btn-primary btn-block mt-3" disabled={loading}>
          {loading ? 'Generiere...' : 'Musik und Geräusche generieren'}
        </button>
      </form>

      {loading && (
        <div className="mb-3">
          <div className="progress">
            <div
              className="progress-bar progress-bar-striped progress-bar-animated"
              style={{ width: `${progress}%` }}
            >
              {progress}%
            </div>
          </div>
          {progressMessage && <p>{progressMessage}</p>}
        </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}

      {combinedAudioUrl && (
        <div className="mb-4">
          <h3>Kombinierte Audio-Datei:</h3>
          <audio controls>
            <source src={combinedAudioUrl} type="audio/mpeg" />
            Ihr Browser unterstützt keine Audiodateien.
          </audio>
        </div>
      )}
    </div>
  );
}

export default App;
