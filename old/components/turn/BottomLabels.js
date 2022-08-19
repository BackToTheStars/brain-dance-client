import { dateFormatter } from '../helpers/formatters/dateFormatter';
import { getShortLink } from '../helpers/formatters/urlFormatter';

const BottomLabels = ({ sourceUrl, date }) => {
  return (
    <>
      {!!sourceUrl && (
        <div className="left-bottom-label">
          <a target="_blank" href={sourceUrl}>
            {getShortLink(sourceUrl)}
          </a>
        </div>
      )}
      {!!date && (
        <div className="right-bottom-label">{dateFormatter(date)}</div>
      )}
    </>
  );
};

export default BottomLabels;
