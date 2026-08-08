import React, { useMemo } from 'react';

interface DataCollectionPanelProps {
  imagesCaptured: number;
}

export const DataCollectionPanel: React.FC<DataCollectionPanelProps> = ({ imagesCaptured }) => {
  // Generate some mock data based on imagesCaptured to show in the UI
  const mediaItems = useMemo(() => {
    const items = [];
    const count = Math.min(imagesCaptured, 10); // show up to 10 recent items
    for (let i = 0; i < count; i++) {
      const type = i % 3 === 0 ? 'Audio' : 'Image';
      items.push({
        id: imagesCaptured - i,
        type,
        timestamp: new Date(Date.now() - i * 60000).toLocaleTimeString(),
        name: type === 'Image' ? `IMG_SAT_${imagesCaptured - i}.tiff` : `SIG_VLF_${imagesCaptured - i}.wav`,
      });
    }
    return items;
  }, [imagesCaptured]);

  return (
    <div className="widget" style={{ marginTop: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div className="widget-title">DATA COLLECTION & MEDIA</div>
      
      <div style={{ padding: '0.5rem', flex: 1, overflowY: 'auto' }}>
        {mediaItems.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', marginTop: '1rem' }}>
            No media captured yet.
          </div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {mediaItems.map(item => (
              <li key={item.id} style={{
                background: 'rgba(0,0,0,0.2)',
                padding: '0.5rem',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.75rem'
              }}>
                <span style={{ fontSize: '1.2rem' }}>
                  {item.type === 'Image' ? '📷' : '🔊'}
                </span>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ color: 'var(--color-primary)', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.name}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>
                    {item.timestamp}
                  </div>
                </div>
                <button className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.65rem' }}>
                  View
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
