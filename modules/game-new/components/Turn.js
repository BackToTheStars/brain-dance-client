import { useSelector } from 'react-redux';

import Header from '@/modules/turns/components/widgets/Header';
import DateAndSourceUrl from '@/modules/turns/components/widgets/header/DateAndSourceUrl';
import Paragraph from '@/modules/turns/components/widgets/paragraph/Paragraph';

import Picture from '@/modules/turns/components/widgets/picture/Picture';
import Video from '@/modules/turns/components/widgets/Video';

const TurnNew = ({ id }) => {
  const turn = useSelector((state) => state.turns.d[id]);
  // return 'TURN NEW';

  const {
    _id,
    contentType,
    dWidgets: {
      s_1: { url: sourceUrl, date },
    },
    widgetToShow,
  } = turn;

  const dontShowHeader = false;
  const wrapperClasses = [
    contentType,
    'react-turn-new',
    'noselect',
    `turn_${_id}`,
  ];

  const registerHandleResize = () => {};
  const unregisterHandleResize = () => {};

  const WidgetTypes = {
    header: Header,
    video: Video,
    paragraph: Paragraph,
    picture: Picture,
    // source
    // compressed
  };

  return (
    <div className={wrapperClasses.join(' ')} style={{}}>
      {widgetToShow.map(({ type, id }) => {
        const UnknownWidget = () => 'UnknownWidget';
        const Component = WidgetTypes[type] || UnknownWidget;
        return (
          <Component
            key={id}
            widgetId={id}
            registerHandleResize={registerHandleResize}
            unregisterHandleResize={unregisterHandleResize}
            _id={_id}
            turnId={_id}

            // widgetSettings={widgetD['picture1']}
            // pictureOnly={false}
            // widget={widgetD['paragraph1']}
            // notRegisteredWidgetsCount={notRegisteredWidgetsCount}
          />
        );
      })}
      {dontShowHeader && !!date && !!sourceUrl && (
        <div className="bottom-date-and-sourceurl">
          <DateAndSourceUrl {...{ widgetId: 's_1', date, sourceUrl }} />
        </div>
      )}
    </div>
  );
};

export default TurnNew;
