import React from 'react';
export const OnboardingGuide = ({ onComplete }: { onComplete: () => void }) => {
  React.useEffect(() => {
    onComplete();
  }, [onComplete]);
  return null;
};
