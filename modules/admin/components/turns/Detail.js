import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button, Collapse, Divider } from 'antd';
import { getAdminTurnRequest, moveAudioRequest } from '../../requests';
import { STATIC_AUDIO_URL } from '@/config/server';

const AudioBlock = ({ turn, reloadTurn }) => {
  const [inProgress, setInProgress] = useState(false);
  const { audioUrl } = turn;
  const moveToStatic = () => {
    setInProgress(true);
    moveAudioRequest({
      turnId: turn._id,
      audioUrl,
    })
      .then(() => {
        reloadTurn();
        setInProgress(false);
      })
      .catch((err) => {
        console.error(err);
        setInProgress(false);
      });
  };
  if (!audioUrl || audioUrl.startsWith(STATIC_AUDIO_URL)) {
    return null;
  }
  return (
    <div className="flex flex-col gap-2">
      <div>Current Audio Url: {audioUrl}</div>
      {inProgress ? (
        <Button disabled className="w-32">
          In Progress
        </Button>
      ) : (
        <Button onClick={moveToStatic} className="w-32">
          Move To Static
        </Button>
      )}
    </div>
  );
};

const TurnDetail = () => {
  const [turn, setTurn] = useState();
  const { turn_id } = useParams();
  const reloadTurn = () =>
    getAdminTurnRequest(turn_id).then((data) => setTurn(data.item));
  useEffect(() => {
    if (!turn_id) return;
    reloadTurn();
  }, [turn_id]);

  if (!turn) return null;
  return (
    <div className="mt-2 flex flex-col gap-2">
      <h3>Turn #{turn._id}</h3>
      <AudioBlock turn={turn} reloadTurn={reloadTurn} />
      <Collapse defaultActiveKey={[]}>
        <Collapse.Panel header="Full Turn Data" key="1">
          <pre>{JSON.stringify(turn, null, 2)}</pre>
        </Collapse.Panel>
      </Collapse>
    </div>
  );
};

export default TurnDetail;
