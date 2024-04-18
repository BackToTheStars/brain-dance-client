import { getShortLink } from '../../helpers/formatters/urlFormatter';
import { dateFormatter } from '../../helpers/formatters/dateFormatter';
import EarthLink from '@/modules/ui/icons/EarthLink';
import CalendarDate from '@/modules/ui/icons/CalendarDate';
import { memo } from 'react';

const DateAndSourceUrl = ({ sourceUrl, date }) => {
  return (
    <div className="flex_mod">
      {!!sourceUrl && (
        <a href={sourceUrl} className="flex_mod_site" target="_blank">
          <EarthLink />
          <span>{getShortLink(sourceUrl)}</span>
        </a>
      )}

      {!!date && (
        <div className="mod_date">
          <CalendarDate />
          <span>{dateFormatter(date)}</span>
        </div>
      )}
    </div>
  );
};

export default memo(DateAndSourceUrl);
