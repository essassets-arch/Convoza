import React from 'react';

export interface WhatsAppIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

/**
 * Proprietary CONVOZA "Connected-C" Brand Mark (100% Meta Trademark Compliant)
 */
export const WhatsAppIcon: React.FC<WhatsAppIconProps> = ({
  className = 'w-5 h-5',
  ...props
}) => {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* Geometric C-Arc */}
      <path d="M12 2.5A9.5 9.5 0 1 0 19.42 17.94a1.65 1.65 0 0 0-2.58-2.06A6.2 6.2 0 1 1 16.84 8.12a1.65 1.65 0 1 0 2.58-2.06A9.46 9.46 0 0 0 12 2.5Z" />
      {/* Connected Conversation Nodes ("Conversations. Connected.") */}
      <path d="M11.75 9.75a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Zm7.5 0a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Zm-6.5 1.35h5.5v1.8h-5.5v-1.8Z" />
    </svg>
  );
};
