import { createSlice } from '@reduxjs/toolkit';
import { setCookie } from 'cookies-next';

const initialState = {
  language: null,
};

export const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    setLanguage: (state, action) => {
      state.language = action.payload;
      setCookie('language', action.payload);
    },
  },
});

export const { setLanguage } = languageSlice.actions;

export const changeLanguage = (lang) => (dispatch) => {
  dispatch(setLanguage(lang));
};

export default languageSlice.reducer;