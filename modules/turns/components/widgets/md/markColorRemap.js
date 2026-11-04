import { MARK_COLORS } from '@/config/server';
import { parseColorRemap } from './markColors';

// Сопоставление цветов выделений на карточках, зашитое при сборке; форма и исходник его не видят.
export const MARK_COLOR_REMAP = parseColorRemap(MARK_COLORS);
