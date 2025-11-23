'use client';

import * as React from 'react';

interface OptimizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string | number;
}

export const OptimizedList = React.memo(function OptimizedList<T>({
  items,
  renderItem,
  keyExtractor,
}: OptimizedListProps<T>) {
  const MemoizedItem = React.memo(function ListItem({
    item,
    index,
  }: {
    item: T;
    index: number;
  }) {
    return <>{renderItem(item, index)}</>;
  });

  return (
    <>
      {items.map((item, index) => (
        <MemoizedItem key={keyExtractor(item, index)} item={item} index={index} />
      ))}
    </>
  );
}) as <T>(props: OptimizedListProps<T>) => React.ReactElement;
