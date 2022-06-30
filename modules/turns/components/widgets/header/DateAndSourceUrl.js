import { getShortLink } from '../../helpers/formatters/urlFormatter';
import { dateFormatter } from '../../helpers/formatters/dateFormatter';

const DateAndSourceUrl = ({ sourceUrl, date }) => {
  return (
    <div className="flex_mod">
      {!!sourceUrl && (
        <a href={sourceUrl} className="flex_mod_site" target="_blank">
          {getShortLink(sourceUrl)}
        </a>
      )}

      {!!date && <div className="mod_date">{dateFormatter(date)}</div>}
    </div>
  );
};

export default DateAndSourceUrl;
