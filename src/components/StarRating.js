import React, { useState } from 'react';

const StarRating = ({ rating = 0, onRatingChange, readOnly = false, size = '20px' }) => {
  const [hoverRating, setHoverRating] = useState(0);
  
  const stars = [1, 2, 3, 4, 5];
  
  const handleClick = (star, isHalf) => {
    if (readOnly) return;
    const newRating = isHalf ? star - 0.5 : star;
    onRatingChange(newRating);
  };
  
  const handleMouseMove = (star, e, starElement) => {
    if (readOnly) return;
    const rect = starElement.getBoundingClientRect();
    const isLeftHalf = e.clientX - rect.left < rect.width / 2;
    setHoverRating(isLeftHalf ? star - 0.5 : star);
  };
  
  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoverRating(0);
    }
  };
  
  const displayRating = hoverRating || rating;
  
  const getStarFill = (star) => {
    if (displayRating >= star) {
      return 'full';
    } else if (displayRating >= star - 0.5) {
      return 'half';
    }
    return 'empty';
  };
  
  return (
    <div 
      className="star-rating" 
      onMouseLeave={handleMouseLeave}
      style={{ display: 'inline-flex', gap: '2px', cursor: readOnly ? 'default' : 'pointer' }}
    >
      {stars.map(star => {
        const fill = getStarFill(star);
        return (
          <div
            key={star}
            className="star-container"
            style={{ position: 'relative', width: size, height: size }}
            onMouseMove={(e) => handleMouseMove(star, e, e.currentTarget)}
          >
            {/* Background empty star */}
            <svg
              viewBox="0 0 24 24"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: size,
                height: size,
                fill: '#e0e0e0',
              }}
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            
            {/* Filled star or half star */}
            {fill !== 'empty' && (
              <svg
                viewBox="0 0 24 24"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: size,
                  height: size,
                  fill: '#FFD700',
                  clipPath: fill === 'half' ? 'inset(0 50% 0 0)' : 'none',
                }}
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            )}
            
            {/* Clickable areas for half and full */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '50%',
                height: '100%',
                cursor: readOnly ? 'default' : 'pointer',
              }}
              onClick={() => handleClick(star, true)}
            />
            <div
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '50%',
                height: '100%',
                cursor: readOnly ? 'default' : 'pointer',
              }}
              onClick={() => handleClick(star, false)}
            />
          </div>
        );
      })}
      {!readOnly && rating > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRatingChange(0);
          }}
          style={{
            marginLeft: '8px',
            background: 'none',
            border: 'none',
            color: '#999',
            cursor: 'pointer',
            fontSize: '14px',
            padding: '0',
          }}
          title="Clear rating"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default StarRating;
