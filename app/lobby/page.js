'use client';
import CommonModal from '@/modules/lobby/components/modals/Common';
import GridLayout from '@/modules/lobby/components/layouts/GridLayout';
import { loadSettings } from '@/modules/settings/redux/actions';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import '@/theme/scss/index.scss';
import '../../themes/lobby/index.scss';

export default function Home() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadSettings());
  }, []);
  return (
    <>
      <GridLayout />
      <CommonModal />
    </>
  );
}
