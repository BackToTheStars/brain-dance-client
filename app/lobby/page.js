'use client';
import GridLayout from '@/modules/lobby/components/layouts/GridLayout';
import { loadSettings } from '@/modules/settings/redux/actions';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export default function Home() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadSettings());
  }, []);
  return (
    <div>
      <GridLayout />
    </div>
  );
}
