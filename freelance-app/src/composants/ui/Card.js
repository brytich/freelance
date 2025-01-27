import React from 'react';

// Composant pour envelopper le contenu d'une carte
export const CardContent = ({ children, className, ...props }) => {
  return (
    <div className={`p-4 ${className}`} {...props}>
      {children}
    </div>
  );
};

// Composant principal Card
const Card = ({ children, className, ...props }) => {
  return (
    <div
      className={`rounded-lg shadow-md bg-gray-800 text-white ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
