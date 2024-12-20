import React from 'react';
import { MapPin } from 'lucide-react';

interface AddressLinkProps {
  address: string;
  city: string;
  postalCode: string;
  className?: string;
  iconSize?: number;
}

export const AddressLink = ({ address, city, postalCode, className = '', iconSize = 16 }: AddressLinkProps) => {
  const fullAddress = `${address}, ${postalCode} ${city}`;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;

  return (
    <a
      href={mapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center hover:text-indigo-600 ${className}`}
    >
      <MapPin size={iconSize} className="mr-2" />
      {fullAddress}
    </a>
  );
};