import { getShortLink } from '../../helpers/formatters/urlFormatter';
import { dateFormatter } from '../../helpers/formatters/dateFormatter';
import EarthLink from '@/modules/ui/icons/EarthLink';
import CalendarDate from '@/modules/ui/icons/CalendarDate';
import { memo } from 'react';

const DateAndSourceUrl = ({ url, date }) => {
  return (
    <div className="flex items-center gap-3 stb-react-turn__subtitle">
      {!!url && (
        <a
          href={url}
          className="stb-react-turn__link flex items-center gap-1"
          target="_blank"
        >
          <EarthLink />
          <span>{getShortLink(url)}</span>
        </a>
      )}

      {!!date && (
        <div className="flex items-center gap-1">
          <CalendarDate />
          <span>{dateFormatter(date)}</span>
        </div>
      )}
    </div>
  );
};

export default memo(DateAndSourceUrl);
