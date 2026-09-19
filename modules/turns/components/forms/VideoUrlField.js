import { useEffect, useRef, useState } from 'react';
import { Input } from 'antd';
import FileUploading from './FileUploading';
import VideoPreviewBlock from './VideoPreviewBlock';
import {
  FRAME_DEFAULT_SECONDS,
  captureVideoFrame,
  hasPreviewBlock,
  isOwnMediaVideo,
} from '../helpers/videoFrame';
import { TID } from '@/config/testIds';

const IDLE = { busy: false, error: null };

// Черновик кадра привязан к видео: forUrl — адрес, для которого он снят (у файла из
// дропзоны появляется, когда media ответила); без него Save кадр не загружает.
const toDraft = (frame, source) => ({
  dataUrl: frame.dataUrl,
  t: frame.t,
  name: source.name,
  localId: source.id || null,
  forUrl: source.src || null,
});

const VideoUrlField = ({
  value,
  label,
  prefixClass,
  form,
  patchForm,
  changeHandler,
  edition,
  acceptVideos,
  acceptImages,
  uploadVideo,
  uploadImage,
}) => {
  // Файл из дропзоны: { id, url, name, src, savedAtDrop }. Плеер и первый кадр — из
  // него, не дожидаясь загрузки; src — адрес на media после ответа.
  const [local, setLocal] = useState(null);
  const localRef = useRef(null);
  const [capture, setCapture] = useState(IDLE);
  // Побеждает последний выбор превью: своя картинка, новый кадр или другое видео
  // отменяют ещё не пришедший результат предыдущего.
  const choiceRef = useRef(0);
  const beginChoice = () => (choiceRef.current += 1);
  const isChoice = (choice) => choiceRef.current === choice;
  // Адрес с media относится к тому файлу, который в форме сейчас: пока media
  // отвечала, ссылку могли ввести руками.
  const uploadingIdRef = useRef(null);
  const valueRef = useRef(value);
  valueRef.current = value;

  const replaceLocal = (next) => {
    if (localRef.current) URL.revokeObjectURL(localRef.current.url);
    localRef.current = next;
    setLocal(next);
  };

  useEffect(
    () => () => {
      if (localRef.current) URL.revokeObjectURL(localRef.current.url);
    },
    [],
  );

  // Форму перевели на другой ход — файл прежней формы к нему не относится.
  const editionToken = edition ? edition.token() : 0;
  useEffect(() => {
    beginChoice();
    uploadingIdRef.current = null;
    replaceLocal(null);
    setCapture(IDLE);
  }, [editionToken]);

  const onUrlInput = (next) => {
    beginChoice();
    uploadingIdRef.current = null;
    replaceLocal(null);
    setCapture(IDLE);
    changeHandler(next);
    patchForm({
      videoPreview: '',
      videoPreviewDraft: null,
      videoPreviewError: null,
    });
  };

  const onUploadStart = (file) => {
    const next = {
      id: `${Date.now()}-${Math.random()}`,
      url: URL.createObjectURL(file),
      name: file.name,
      src: null,
      savedAtDrop: form.videoPreview || '',
    };
    const choice = beginChoice();
    uploadingIdRef.current = next.id;
    replaceLocal(next);
    setCapture({ busy: true, error: null });
    patchForm({ videoPreviewDraft: null, videoPreviewError: null });
    captureVideoFrame(next.url, FRAME_DEFAULT_SECONDS)
      .then((frame) => {
        if (!isChoice(choice) || localRef.current?.id !== next.id) return;
        patchForm({ videoPreviewDraft: toDraft(frame, localRef.current) });
        setCapture(IDLE);
      })
      .catch((err) => {
        if (!isChoice(choice) || localRef.current?.id !== next.id) return;
        setCapture({ busy: false, error: err?.code || 'decode' });
      });
  };

  // Прежнее превью снимается только теперь: пока видео грузится, Save хода оставляет
  // старое видео — и старое превью при нём.
  const onUploaded = (src) => {
    const current = localRef.current;
    if (!current || current.id !== uploadingIdRef.current) return;
    uploadingIdRef.current = null;
    changeHandler(src);
    const updated = { ...current, src };
    localRef.current = updated;
    setLocal(updated);
    patchForm((prev) => ({
      videoPreview:
        prev.videoPreview !== current.savedAtDrop ? prev.videoPreview : '',
      videoPreviewDraft:
        prev.videoPreviewDraft?.localId === current.id
          ? { ...prev.videoPreviewDraft, forUrl: src }
          : prev.videoPreviewDraft,
    }));
  };

  const onUploadFailed = () => {
    const current = localRef.current;
    if (!current || current.id !== uploadingIdRef.current) return;
    uploadingIdRef.current = null;
    replaceLocal(null);
    setCapture(IDLE);
    patchForm((prev) => ({
      videoPreviewDraft:
        prev.videoPreviewDraft?.localId === current.id
          ? null
          : prev.videoPreviewDraft,
    }));
  };

  const localIsCurrent = !!local && (!local.src || local.src === value);
  const playerSrc = localIsCurrent
    ? local.url
    : isOwnMediaVideo(value)
      ? value
      : null;

  // Кадр снят после ожидания: источник берётся живой, а не тот, что был на клике —
  // за это время загрузка файла могла дойти и дать ему адрес на media.
  const onFrame = (frame, choice) => {
    if (!isChoice(choice)) return;
    const current = localRef.current;
    const source =
      current && (!current.src || current.src === valueRef.current)
        ? current
        : { name: valueRef.current, src: valueRef.current };
    setCapture(IDLE);
    patchForm({
      videoPreviewDraft: toDraft(frame, source),
      videoPreviewError: null,
    });
  };

  const onCustom = (src) => {
    beginChoice();
    patchForm({
      videoPreview: src,
      videoPreviewDraft: null,
      videoPreviewError: null,
    });
  };

  const draft = form.videoPreviewDraft;
  const shownDraft =
    draft &&
    (draft.forUrl
      ? draft.forUrl === value
      : localIsCurrent && draft.localId === local.id)
      ? draft
      : null;
  const saved =
    localIsCurrent && !local.src && form.videoPreview === local.savedAtDrop
      ? ''
      : form.videoPreview || '';

  return (
    <>
      <Input
        data-test-id={TID.addTurn.field(prefixClass)}
        placeholder={`${label}:`}
        value={value}
        onChange={(e) => onUrlInput(e.target.value)}
      />
      <FileUploading
        changeHandler={onUploaded}
        onStart={onUploadStart}
        onFailed={onUploadFailed}
        edition={edition}
        fileTypeLabel="a video"
        uploadType="videos"
        accept={acceptVideos}
        uploadFunc={uploadVideo}
      />
      {(localIsCurrent || hasPreviewBlock(value)) && (
        <VideoPreviewBlock
          key={playerSrc || 'no-player'}
          playerSrc={playerSrc}
          crossOrigin={!!playerSrc && playerSrc === value}
          draft={shownDraft}
          saved={saved}
          capture={capture}
          saveError={form.videoPreviewError}
          beginFrame={beginChoice}
          onFrame={onFrame}
          onCustom={onCustom}
          edition={edition}
          acceptImages={acceptImages}
          uploadImage={uploadImage}
        />
      )}
    </>
  );
};

export default VideoUrlField;
