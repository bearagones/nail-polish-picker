import React, { useMemo, useState, useRef, useCallback } from 'react';
import { useData } from '../context/DataContext';

const TOTAL_SWATCHES = 216;
const SWATCHES_PER_PAGE = 108;

const DEFAULT_POSITION = { x: 50, y: 50, zoom: 100 };

// Fallback color mapping for polishes without a photo
const COLOR_HEX_MAP = {
  red: '#dc3545',
  orange: '#fd7e14',
  yellow: '#ffc107',
  green: '#28a745',
  blue: '#295982',
  purple: '#6f42c1',
  pink: '#e83e8c',
  nude: '#e0ac69',
  black: '#212529',
  brown: '#8b5a3c',
  grey: '#adb5bd',
  white: '#f8f9fa'
};

// Fallback gradient mapping for toppers without a photo
const TOPPER_GRADIENT_MAP = {
  glossy: 'linear-gradient(135deg, #e0e0e0, #ffffff)',
  matte: 'linear-gradient(135deg, #cfcfcf, #a0a0a0)',
  glitter: 'linear-gradient(135deg, #f6d365, #fda085)',
  shimmer: 'linear-gradient(135deg, #a1c4fd, #c2e9fb)',
  holographic: 'linear-gradient(135deg, #fbc2eb, #a6c1ee, #fbc2eb)',
  chrome: 'linear-gradient(135deg, #e0eafc, #cfdef3, #e0eafc)'
};

const getFallbackStyle = (item) => {
  if (item.itemType === 'polish') {
    const firstColor = Array.isArray(item.colors) ? item.colors[0] : item.color;
    const hex = COLOR_HEX_MAP[firstColor?.toLowerCase()] || '#d4b8a3';
    return { background: hex };
  }

  if (item.itemType === 'topper') {
    const gradient = TOPPER_GRADIENT_MAP[item.type?.toLowerCase()] || 'linear-gradient(135deg, #99CEBE, #BDE6E2)';
    return { background: gradient };
  }

  return { background: '#f1f1f1' };
};

// Renders the actual nail-shaped thumbnail. If the item has a photo, it uses
// the item's swatchPhotoPosition (pan/zoom) to display a cropped preview that
// is independent from the original photo shown in the Collection tab.
const SwatchNailThumbnail = ({ item, className }) => {
  if (!item || !item.photo) {
    return <div className={className} style={item ? getFallbackStyle(item) : { background: '#f1f1f1' }} />;
  }

  const pos = item.swatchPhotoPosition || DEFAULT_POSITION;

  return (
    <div className={className} style={{ position: 'relative', overflow: 'hidden' }}>
      <img
        src={item.photo}
        alt={item.name || 'swatch'}
        draggable={false}
        style={{
          position: 'absolute',
          top: `${pos.y}%`,
          left: `${pos.x}%`,
          width: `${pos.zoom}%`,
          height: `${pos.zoom}%`,
          objectFit: 'cover',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none'
        }}
      />
    </div>
  );
};

const SwatchBook = () => {
  const { nailPolishes, toppers, dispatch } = useData();
  const [selectedItem, setSelectedItem] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [draftPosition, setDraftPosition] = useState(DEFAULT_POSITION);
  const previewRef = useRef(null);
  const dragState = useRef({ dragging: false, startX: 0, startY: 0, startPos: DEFAULT_POSITION });

  // Build a lookup map of swatchNumber -> item (polish or topper)
  const swatchMap = useMemo(() => {
    const map = {};
    const combined = [
      ...nailPolishes.map(p => ({ ...p, itemType: 'polish' })),
      ...toppers.map(t => ({ ...t, itemType: 'topper' }))
    ];

    combined.forEach(item => {
      if (item.swatchNumber !== undefined && item.swatchNumber !== null && item.swatchNumber !== '') {
        const parsed = parseInt(item.swatchNumber, 10);
        if (!isNaN(parsed)) {
          map[parsed] = item;
        }
      }
    });

    return map;
  }, [nailPolishes, toppers]);

  const openEditor = (item) => {
    setEditingItem(item);
    setDraftPosition(item.swatchPhotoPosition || DEFAULT_POSITION);
  };

  const closeEditor = () => {
    setEditingItem(null);
  };

  const handlePointerDown = (e) => {
    e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    dragState.current = {
      dragging: true,
      startX: clientX,
      startY: clientY,
      startPos: draftPosition
    };

    const handleMove = (moveEvent) => {
      if (!dragState.current.dragging || !previewRef.current) return;
      const moveX = moveEvent.touches ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const moveY = moveEvent.touches ? moveEvent.touches[0].clientY : moveEvent.clientY;
      const rect = previewRef.current.getBoundingClientRect();
      const deltaXPercent = ((moveX - dragState.current.startX) / rect.width) * 100;
      const deltaYPercent = ((moveY - dragState.current.startY) / rect.height) * 100;

      setDraftPosition(prev => ({
        ...prev,
        x: Math.min(100, Math.max(0, dragState.current.startPos.x - deltaXPercent)),
        y: Math.min(100, Math.max(0, dragState.current.startPos.y - deltaYPercent))
      }));
    };

    const handleUp = () => {
      dragState.current.dragging = false;
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleUp);
  };

  const handleZoomChange = useCallback((e) => {
    const zoom = parseInt(e.target.value, 10);
    setDraftPosition(prev => ({ ...prev, zoom }));
  }, []);

  const handleResetPosition = () => {
    setDraftPosition(DEFAULT_POSITION);
  };

  const handleSavePosition = () => {
    if (!editingItem) return;

    if (editingItem.itemType === 'polish') {
      dispatch({
        type: 'UPDATE_POLISH',
        payload: {
          originalName: editingItem.name,
          originalBrand: editingItem.brand,
          updatedPolish: { swatchPhotoPosition: draftPosition }
        }
      });
    } else if (editingItem.itemType === 'topper') {
      dispatch({
        type: 'UPDATE_TOPPER',
        payload: {
          originalName: editingItem.name,
          originalBrand: editingItem.brand,
          updatedTopper: { swatchPhotoPosition: draftPosition }
        }
      });
    }

    // Keep the detail modal in sync so the change reflects immediately
    setSelectedItem(prev => prev && prev.name === editingItem.name && prev.brand === editingItem.brand
      ? { ...prev, swatchPhotoPosition: draftPosition }
      : prev);

    setEditingItem(null);
  };

  const renderPage = (startNum, endNum) => {
    const slots = [];
    for (let i = startNum; i <= endNum; i++) {
      slots.push(i);
    }

    return (
      <div className="swatch-page">
        <div className="swatch-grid">
          {slots.map(num => {
            const item = swatchMap[num];
            const paddedNum = String(num).padStart(3, '0');

            return (
              <div
                key={num}
                className={`swatch-slot ${item ? 'swatch-filled' : 'swatch-empty'}`}
                onClick={() => item && setSelectedItem(item)}
                title={item ? `${item.name} - ${item.brand}` : `Swatch #${paddedNum} (empty)`}
              >
                <SwatchNailThumbnail item={item} className="swatch-nail" />
                <div className="swatch-number-label">{paddedNum}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const totalFilled = Object.keys(swatchMap).length;

  return (
    <div className="swatch-book-container">
      <div className="swatch-book-header">
        <h2>My Swatch Book</h2>
        <p className="swatch-book-subtitle">
          {totalFilled} of {TOTAL_SWATCHES} swatches filled
        </p>
      </div>

      <div className="swatch-book">
        {renderPage(1, SWATCHES_PER_PAGE)}
        <div className="swatch-book-spine" />
        {renderPage(SWATCHES_PER_PAGE + 1, TOTAL_SWATCHES)}
      </div>

      {selectedItem && !editingItem && (
        <div className="swatch-detail-modal" onClick={() => setSelectedItem(null)}>
          <div className="swatch-detail-content" onClick={(e) => e.stopPropagation()}>
            <button className="swatch-detail-close" onClick={() => setSelectedItem(null)}>×</button>
            <SwatchNailThumbnail item={selectedItem} className="swatch-detail-nail" />
            <h3>{selectedItem.name}</h3>
            <p className="swatch-detail-brand">{selectedItem.brand}</p>
            <p className="swatch-detail-number">Swatch #{String(selectedItem.swatchNumber).padStart(3, '0')}</p>
            {selectedItem.itemType === 'polish' && (
              <div className="swatch-detail-tags">
                {Array.isArray(selectedItem.colors) ? (
                  selectedItem.colors.map((color, idx) => (
                    <span key={idx} className="color-tag" style={{ marginRight: '4px' }}>
                      {color.charAt(0).toUpperCase() + color.slice(1)}
                    </span>
                  ))
                ) : (
                  selectedItem.color && <span className="color-tag">{selectedItem.color}</span>
                )}
                {selectedItem.formula && <span className="formula-tag">{selectedItem.formula}</span>}
              </div>
            )}
            {selectedItem.itemType === 'topper' && (
              <div className="swatch-detail-tags">
                <span className="formula-tag">{selectedItem.type}</span>
              </div>
            )}

            {selectedItem.photo && (
              <button className="swatch-adjust-fit-button" onClick={() => openEditor(selectedItem)}>
                ✏️ Adjust Fit in Swatch Book
              </button>
            )}
          </div>
        </div>
      )}

      {editingItem && (
        <div className="swatch-position-editor-modal" onClick={closeEditor}>
          <div className="swatch-position-editor-content" onClick={(e) => e.stopPropagation()}>
            <button className="swatch-detail-close" onClick={closeEditor}>×</button>
            <h3>Adjust Swatch Fit</h3>
            <p className="position-editor-hint">Drag the image to reposition &middot; use the slider to zoom</p>

            <div
              className="position-editor-preview"
              ref={previewRef}
              onMouseDown={handlePointerDown}
              onTouchStart={handlePointerDown}
            >
              <img
                src={editingItem.photo}
                alt={editingItem.name}
                draggable={false}
                style={{
                  position: 'absolute',
                  top: `${draftPosition.y}%`,
                  left: `${draftPosition.x}%`,
                  width: `${draftPosition.zoom}%`,
                  height: `${draftPosition.zoom}%`,
                  objectFit: 'cover',
                  transform: 'translate(-50%, -50%)',
                  cursor: 'grab',
                  pointerEvents: 'none'
                }}
              />
            </div>

            <div className="position-editor-controls">
              <label htmlFor="zoom-slider">Zoom: {draftPosition.zoom}%</label>
              <input
                id="zoom-slider"
                type="range"
                min="100"
                max="400"
                value={draftPosition.zoom}
                onChange={handleZoomChange}
              />
            </div>

            <div className="position-editor-actions">
              <button className="position-editor-reset" onClick={handleResetPosition}>Reset</button>
              <button className="position-editor-cancel" onClick={closeEditor}>Cancel</button>
              <button className="position-editor-save" onClick={handleSavePosition}>Save</button>
            </div>

            <p className="position-editor-note">
              This only changes how the photo appears in your Swatch Book — your original photo in the Collection tab stays the same.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SwatchBook;
