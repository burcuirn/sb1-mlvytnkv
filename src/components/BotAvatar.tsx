import React from 'react';

interface Props {
  size?: number;
  className?: string;
}

export function BotAvatar({ size = 32, className = '' }: Props) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <img 
        src="https://plxerycaoxagsdomzvji.supabase.co/storage/v1/object/sign/images/sezar.jpeg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJpbWFnZXMvc2V6YXIuanBlZyIsImlhdCI6MTczOTAyMjQ4MiwiZXhwIjoxNzcwNTU4NDgyfQ.y-9H_wTG5GVWG7kub5kp6yQ2CY34KJA4d4Q1fIz3jXI"
        alt="Sezar AI"
        className="w-full h-full object-cover rounded-full"
        style={{ width: size, height: size }}
      />
    </div>
  );
}