import React, { useState, useEffect, useRef } from 'react';

interface TypewriterProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  onUpdate?: () => void;
}

export const Typewriter: React.FC<TypewriterProps> = ({ 
  text, 
  speed = 0, 
  onComplete, 
  onUpdate 
}) => {
  const [displayedContent, setDisplayedContent] = useState('');
  const onCompleteRef = useRef(onComplete);
  const onUpdateRef = useRef(onUpdate);
  
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    if (onUpdateRef.current) {
      onUpdateRef.current();
    }
  }, [displayedContent]);

  useEffect(() => {
    // 1. Prepare Content & Tokens
    // Regex splits by HTML tags/entities to preserve them
    const tokens = text.split(/((?:<[^>]*>)|(?:&[^;]+;))/g).filter(t => t);
    
    // 2. Typing Loop State
    let tokenIndex = 0;
    let charIndex = 0;
    let currentContent = '';
    let mounted = true;

    const typeNext = () => {
      if (!mounted) return;
      
      if (tokenIndex >= tokens.length) {
        if (onCompleteRef.current) {
          onCompleteRef.current();
        }
        return;
      }

      const token = tokens[tokenIndex];
      const isTagOrEntity = /^(<[^>]*>|&[^;]+;)$/.test(token);

      if (isTagOrEntity) {
        // Instant render for tags
        currentContent += token;
        setDisplayedContent(currentContent);
        tokenIndex++;

        // No delay for tags
        requestAnimationFrame(typeNext);
      } else {
        // Typing text characters
        // Use Array.from to correctly handle emojis (surrogate pairs)
        const chars = Array.from(token);
        
        if (charIndex < chars.length) {
          currentContent += chars[charIndex];
          setDisplayedContent(currentContent);
          
          charIndex++;
          
          // Progress Event
          const totalTokens = tokens.length;
          // Note: Approximate progress since we use charIndex against chars.length
          const progress = ((tokenIndex + (charIndex / chars.length)) / totalTokens) * 100;
          window.dispatchEvent(new CustomEvent('typewriter-progress', { detail: { progress: Math.min(progress, 100) } }));

          setTimeout(typeNext, speed);
        } else {
          // Token finished
          tokenIndex++;
          charIndex = 0;
          requestAnimationFrame(typeNext);
        }
      }
    };

    // Reset and Start
    setDisplayedContent('');
    typeNext();

    return () => {
      mounted = false;
    };
  }, [text, speed]); // Re-run if text or speed changes

  return <div style={{ whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{ __html: displayedContent }} />;
};
