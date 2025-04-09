import React, { useState } from 'react';
import './App.css';
import { QRCodeCanvas } from 'qrcode.react';

function App() {
  const [originalUrl, setOriginalUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [clickCount, setClickCount] = useState(null);
  const [error, setError] = useState('');
  const [qrSize, setQrSize] = useState(128);

  const handleShorten = async (e) => {
    e.preventDefault();
    setError('');
    setClickCount(null);

    try {
      const res = await fetch('http://localhost:5000/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ original_url: originalUrl }),
      });

      const data = await res.json();
      if (res.ok) {
        setShortUrl(data.short_url);
      } else {
        setError(data.error || 'Failed to shorten URL.');
      }
    } catch (err) {
      setError('Server error');
    }
  };

  const fetchStats = async () => {
    if (!shortUrl) return;
    const code = shortUrl.split('/').pop();

    try {
      const res = await fetch(`http://localhost:5000/stats/${code}`);
      const data = await res.json();
      if (res.ok) {
        setClickCount(data.click_count);
      } else {
        setError(data.error || 'Failed to fetch stats');
      }
    } catch (err) {
      setError('Server error');
    }
  };

  const handleDownloadQR = () => {
    const canvas = document.getElementById('qr-code');
    const pngUrl = canvas
      .toDataURL('image/png')
      .replace('image/png', 'image/octet-stream');

    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = 'qrcode.png';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="App">
      <h1>🔗 URL Shortener</h1>
      <form onSubmit={handleShorten}>
        <input
          type="text"
          value={originalUrl}
          onChange={(e) => setOriginalUrl(e.target.value)}
          placeholder="Enter a long URL"
          required
        />
        <button type="submit">Shorten</button>
      </form>

      {shortUrl && (
        <div>
          <p>
            Short URL:{' '}
            <a href={shortUrl} target="_blank" rel="noopener noreferrer">
              {shortUrl}
            </a>
          </p>
          
          {/* QR code is displayed automatically after URL shortening */}
          <div className="qr-container">
            <QRCodeCanvas
              id="qr-code"
              value={shortUrl}
              size={qrSize}
              level="H"
              includeMargin={true}
            />
            <div>
              <label>QR Size: {qrSize}px</label>
              <input
                type="range"
                min="64"
                max="256"
                value={qrSize}
                onChange={(e) => setQrSize(Number(e.target.value))}
              />
              <button onClick={handleDownloadQR}>⬇ Download QR</button>
            </div>
          </div>

          {/* Stats button and results below QR code */}
          <div className="stats-container">
            <button onClick={fetchStats}>📊 Get Click Stats</button>
            {clickCount !== null && <p>🔁 Total Clicks: {clickCount}</p>}
          </div>
        </div>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default App;