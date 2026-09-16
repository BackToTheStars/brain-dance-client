import { useEffect, useRef, useState } from 'react';
import { Button, InputNumber } from 'antd';
import FileUploading from './FileUploading';
import {
  FRAME_DEFAULT_SECONDS,
  clampSeconds,
  grabVideoFrame,
  roundSeconds,
} from '../helpers/videoFrame';
import { TID } from '@/config/testIds';

const DEFAULT_PREVIEW = '/img/video-default.png';

const FRAME_ERRORS = {
  decode:
    "The browser can't decode this video, so there is no frame to take. Upload a custom image instead.",
  timeout: "The video didn't load in time.",
  load: "The video couldn't be loaded.",
  cors: "The video host doesn't allow taking frames.",
};

const VideoPreviewBlock = ({
  playerSrc,
  crossOrigin,
  draft,
  saved,
  capture,
  saveError,
  onFrame,
  onCustom,
  acceptImages,
  uploadImage,
}) => {
  const playerRef = useRef(null);
  const [seconds, setSeconds] = useState(draft?.t ?? FRAME_DEFAULT_SECONDS);
  const [player, setPlayer] = useState('loading'); // loading | ready | unsupported
  const [taking, setTaking] = useState(false);
  const [takeError, setTakeError] = useState(null);

  const seekTo = (value) => {
    setSeconds(value);
    const video = playerRef.current;
    if (video && player === 'ready') {
      video.currentTime = clampSeconds(value, video.duration);
    }
  };

  // Предложенный кадр приходит после монтирования — плеер встаёт на его секунду.
  useEffect(() => {
    if (draft) seekTo(draft.t);
  }, [draft?.dataUrl]);

  const onLoadedMetadata = (e) => {
    const video = e.currentTarget;
    if (!video.videoWidth) {
      setPlayer('unsupported');
      return;
    }
    setPlayer('ready');
    video.currentTime = clampSeconds(seconds, video.duration);
  };

  const takeFrame = async () => {
    const video = playerRef.current;
    setTaking(true);
    setTakeError(null);
    try {
      video.pause();
      onFrame(await grabVideoFrame(video, seconds));
    } catch (err) {
      setTakeError(err?.code || 'decode');
    } finally {
      setTaking(false);
    }
  };

  const canTake = !!playerSrc && player !== 'unsupported';
  const source = draft ? 'draft' : saved ? 'saved' : 'default';
  const frameError =
    takeError || capture.error || (player === 'unsupported' ? 'decode' : null);
  const error = saveError || (frameError && FRAME_ERRORS[frameError]);

  return (
    <div
      className="video-preview mt-2 flex flex-col gap-2"
      data-test-id={TID.videoPreview.root}
      data-frames={canTake ? 'true' : 'false'}
    >
      <div className="flex gap-3 items-start flex-wrap">
        <div className="flex flex-col gap-1">
          <span className="text-xs opacity-70">Preview</span>
          <img
            key={source}
            src={draft ? draft.dataUrl : saved || DEFAULT_PREVIEW}
            alt=""
            width={160}
            height={90}
            style={{ objectFit: 'cover' }}
            onError={(e) => {
              if (!e.currentTarget.src.endsWith(DEFAULT_PREVIEW)) {
                e.currentTarget.src = DEFAULT_PREVIEW;
              }
            }}
            data-test-id={TID.videoPreview.current}
            data-source={source}
            data-frame-seconds={draft?.t}
          />
        </div>
        {!!playerSrc && (
          <video
            ref={playerRef}
            crossOrigin={crossOrigin ? 'anonymous' : undefined}
            src={playerSrc}
            controls
            muted
            preload="metadata"
            width={240}
            height={135}
            style={{ display: canTake ? 'block' : 'none', background: '#000' }}
            onLoadedMetadata={onLoadedMetadata}
            onTimeUpdate={(e) =>
              setSeconds(roundSeconds(e.currentTarget.currentTime))
            }
            onError={() => setPlayer('unsupported')}
            data-test-id={TID.videoPreview.player}
          />
        )}
      </div>

      {canTake && (
        <div className="flex gap-2 items-center flex-wrap">
          <span>Seconds:</span>
          <InputNumber
            min={0}
            step={0.1}
            value={seconds}
            onChange={(value) => seekTo(Number(value) || 0)}
            data-test-id={TID.videoPreview.seconds}
          />
          <Button
            onClick={takeFrame}
            loading={taking}
            disabled={player !== 'ready' || capture.busy}
            data-test-id={TID.videoPreview.take}
          >
            Take frame
          </Button>
        </div>
      )}

      {(capture.busy || taking) && (
        <div data-test-id={TID.videoPreview.capturing}>Taking a frame…</div>
      )}

      <div data-test-id={TID.videoPreview.custom}>
        <FileUploading
          changeHandler={onCustom}
          fileTypeLabel="a custom preview image"
          uploadType="images"
          accept={acceptImages}
          uploadFunc={uploadImage}
        />
      </div>

      {!!error && (
        <div className="drag-n-drop-error" data-test-id={TID.videoPreview.error}>
          {error}
        </div>
      )}
    </div>
  );
};

export default VideoPreviewBlock;
