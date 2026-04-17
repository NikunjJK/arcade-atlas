'use client';

import { useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';

export function AdminSuccessToast({ updated }: { updated?: string }) {
  useEffect(() => {
    if (updated === '1') {
      toast.success('Game updated successfully');
    }
  }, [updated]);

  return <Toaster position="top-right" />;
}