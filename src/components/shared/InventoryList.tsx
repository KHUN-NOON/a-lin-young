import React from 'react';
import { useInventory } from '@/hooks/useLiveQuery';
import type { InventoryItem } from '@/types';

export const InventoryList: React.FC = () => {
  const items = useInventory();

  if (!items?.length) {
    return <p className="text-center text-muted">No items in inventory.</p>;
  }

  return (
    <ul className="space-y-2">
      {items.map((item: InventoryItem) => (
        <li key={item.id} className="flex justify-between p-2 border rounded">
          <span>{item.name}</span>
          <span>{item.quantity} {item.unit}</span>
        </li>
      ))}
    </ul>
  );
};

