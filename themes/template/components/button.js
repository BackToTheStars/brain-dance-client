import { Button as BaseButton } from '@/themes/base/components/ui/buttons';
import { SIZE_MD } from '@/config/ui/size';
import { useSelector } from 'react-redux';

const themeName = 'tmp';

const getButtonClasses = (className) => {
  return [`theme-${themeName}-btn`, className].filter(Boolean).join(' ');
};

const getButtonStyles = (style = {}, { fontSize }) => {
  const styles = { ...style };
  if (fontSize) {
    styles.fontSize = fontSize + 'px';
  }
  return { ...styles, ...style };
};

// - **Презентационные UI-компоненты**. Темизированные компоненты, которые не используют
// ручных настроек из контекста или хранилища. Например, используются вне областей
// настраиваемого вручную контента или интерфейса. Все настройки принимают через props.
// Используют подготовленные css-переменные приложения и темы. Контролировать их стили
// удобнее всего через переменные стандартных размеров и цветов, классы tailwind,
// при необходимости готовые компоненты antd. Нестандартные стили передаются через
// props.style или через дополнительные css-классы className.
// Пример: ```@import { Button } '@/themes/discourse/components/button';```
export const Button = ({ children, className, ...props }) => {
  // добавляем классы для темизации
  const classNames = getButtonClasses(className);

  return (
    <BaseButton {...props} className={classNames}>
      {children}
    </BaseButton>
  );
};

// - **Настраиваемые UI-компоненты**. Обёртки вокруг **Презентационных UI-компонентов**,
// связанные с конкретным слайсом хранилища, передаваемым им через props.selectorKey. Например,
// используются обёртками в областях настраиваемого вручную контента, интерфейса или модулей.
// Желательно не работать с ними напрямую. Используют подготовленные css-переменные приложения и темы,
// а также настройки из хранилища. Пример: ```@import { CustomButton } '@/themes/discourse/components/button';``
export const CustomButton = ({
  children,
  style,
  size = SIZE_MD,
  selectorKey,
  ...props
}) => {
  const customSettings = useSelector((s) => s.ui[selectorKey].custom);
  const fontSize = customSettings.fontSize[size];

  const styles = getButtonStyles(style, { fontSize });

  return (
    <Button {...props} style={styles} size={size}>
      {children}
    </Button>
  );
};

// - **Настраиваемые компоненты интерфейса**, **Настраиваемые компоненты контента**, **Настраиваемые компоненты модулей**. Обёртки вокруг **Настраиваемые UI-компонентов**, содержат props.selectorKey и специфические стили и классы. Примеры:
// ```@import { Button } '@/modules/turns/components/button';```
// ```@import { ContentButton } '@/themes/discourse/components/button';```
// ```@import { InterButton } '@/themes/discourse/components/button';```
// кнопка интерфейса (настраиваемая)
export const IntButton = ({ children, ...props }) => {
  return (
    <CustomButton {...props} selectorKey="interfaceSettings">
      {children}
    </CustomButton>
  );
};

// кнопка контента (настраиваемая)
export const ContentButton = ({ children, ...props }) => {
  return (
    <CustomButton {...props} selectorKey="contentSettings">
      {children}
    </CustomButton>
  );
};
