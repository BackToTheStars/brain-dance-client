import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  isNotMediaUrl,
  needsProbe,
  probeMedia,
} from '../helpers/mediaUrlCheck';

// Проверка новых ссылок медиа-полей перед Save и окно «Похоже, это не …». Ссылки идут
// по очереди; прошли все — onChecked(save). Таймаут пробы отказом не считается.
export const useMediaLinkCheck = ({ edition, onChecked }) => {
  const t = useTranslations('Game.turnForm.notMedia');
  // Редакция, чья ссылка сейчас проверяется: Save блокируется только у неё.
  const [checkingLink, setCheckingLink] = useState(0);
  // { name, url, reason, rest, save }, где rest — ещё не проверенные поля.
  const [notMedia, setNotMedia] = useState(null);
  const confirmedNotMedia = useRef(null);
  // Поле последнего окна — отдельно: заголовок не гаснет на анимации закрытия.
  const [notMediaName, setNotMediaName] = useState('image');

  // Форму закрыли или перевели на другой ход во время пробы — не сохраняется ничего.
  const checkMediaLinks = ([link, ...rest], save) => {
    if (!link) return onChecked(save);
    const { name, type, url } = link;
    const next = () => checkMediaLinks(rest, save);
    const ask = (reason) => {
      setNotMediaName(name);
      setNotMedia({ name, url, reason, rest, save });
    };
    if (isNotMediaUrl(url, type)) return ask('type');
    if (!needsProbe(url, type)) return next();
    const token = edition.token();
    setCheckingLink(token);
    probeMedia(url, type).then((result) => {
      setCheckingLink((prev) => (prev === token ? 0 : prev));
      if (!edition.isCurrent(token)) return;
      if (result === 'error') ask('load');
      else next();
    });
  };

  return {
    checkMediaLinks,
    checking: edition.isCurrent(checkingLink),
    notMedia,
    // type — ссылка по адресу ведёт на файл другого типа, load — не открылась пробой
    notMediaText: {
      title: t(`${notMediaName}.Title`),
      type: t(`${notMediaName}.Type`),
      load: t(`${notMediaName}.Load`),
    },
    cancelNotMedia: () => setNotMedia(null),
    confirmNotMedia: () => {
      confirmedNotMedia.current = notMedia;
      setNotMedia(null);
    },
    // Следующая проверка или окно цитат — после анимации закрытия: следом, а не поверх.
    afterNotMediaClose: () => {
      const confirmed = confirmedNotMedia.current;
      confirmedNotMedia.current = null;
      if (confirmed) checkMediaLinks(confirmed.rest, confirmed.save);
    },
  };
};
