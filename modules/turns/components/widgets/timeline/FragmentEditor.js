import React, { useState, useEffect, useMemo } from 'react';
import { Input, Slider, Timeline } from 'antd';
import { getFormattedDuration } from '../../helpers/formatters/player';
import { FiEdit, FiPlus, FiPlay, FiPause } from 'react-icons/fi';
import {
  addTimelineFragment,
  getDefaultFragments,
  removeTimelineFragment,
} from '../../helpers/timeline/fragments';
import BgFragments from './BgFragments';
import { EditableFragment, InactiveFragment } from './Fragments';
import { TID } from '@/config/testIds';

const formatDuration = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
};

const parseDuration = (timeStr) => {
  const [h, m, s] = timeStr.split(':').map(Number);
  return (h || 0) * 3600 + (m || 0) * 60 + (s || 0);
};

const checkTimeFormat = (timeStr) =>
  /^[0-9]{2}:[0-9]{2}:[0-9]{2}$/.test(timeStr);

const TimeInput = ({
  initialSeconds,
  onTimeChange,
  minTime,
  maxTime,
  testId,
}) => {
  const [value, setValue] = useState(formatDuration(initialSeconds));

  useEffect(() => {
    setValue(formatDuration(initialSeconds));
  }, [initialSeconds]);

  return (
    <Input
      size="small"
      data-test-id={testId}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onPressEnter={() => {
        if (!checkTimeFormat(value)) {
          alert('Invalid time format');
          return;
        }
        const time = parseDuration(value);
        // @todo: check min/max
        if (minTime && time < minTime) {
          alert('Time is too small');
          return;
        }
        if (maxTime && time > maxTime) {
          alert('Time is too big');
          return;
        }
        onTimeChange(time);
      }}
    />
  );
};

// name — start | end: только для data-test-id поля и карандаша
const EditablePoint = ({ name, value, minValue, maxValue, onChange }) => {
  const [mode, setMode] = useState('view');
  return (
    <div className="editable-point flex items-center gap-2">
      {mode === 'view' ? (
        <>
          <span className="editable-point__value">
            {getFormattedDuration(value)}
          </span>
          <FiEdit
            className="cursor-pointer"
            data-test-id={TID.timeline.pointEdit(name)}
            onClick={() => setMode('edit')}
          />
        </>
      ) : (
        <TimeInput
          testId={TID.timeline.field(name)}
          minTime={minValue}
          maxTime={maxValue}
          initialSeconds={value}
          onTimeChange={(seconds) => {
            onChange(seconds);
            setMode('view');
          }}
        />
      )}
    </div>
  );
};

const FragmentEditor = ({
  turnId,
  playing = false,
  togglePlay = () => {},
  progress = 0,
  duration,
  existingFragments = [],
  onFragmentsChange,
  onFragmentDelete,
  widgetMode,
  toggleQuoteClicked = () => {},
  dQuotesWithLines = {},
}) => {
  const [fragments, setFragments] = useState(() => {
    if (existingFragments?.length > 0) {
      return existingFragments;
    } else {
      // return [{ start: 0, end: duration, active: false }];
      return getDefaultFragments(duration);
    }
  });

  const fragmentsToShow = useMemo(() => {
    return [...fragments, { start: duration, end: duration, active: false }];
  }, [fragments, duration]);

  const [selectedFragment, setSelectedFragment] = useState(null);

  const [currentSelection, setCurrentSelection] = useState([0, 0]);

  // id фрагмента, внутри которого сейчас позиция воспроизведения
  const currentFragmentId = useMemo(() => {
    if (!duration || !(progress > 0)) return null;
    const current = fragments.find(
      (fragment) => progress >= fragment.start && progress < fragment.end,
    );
    return current ? current.id : null;
  }, [fragments, duration, progress]);

  useEffect(() => {
    // Обновляем фрагменты при изменении existingFragments
    setFragments(
      existingFragments.length > 0
        ? existingFragments
        : getDefaultFragments(duration),
    );
  }, [existingFragments]);

  const handleSliderChange = (value) => {
    setCurrentSelection(value);
  };

  const isOverlapping = (newStart, newEnd) => {
    return fragments.some((fragment) => {
      if (!fragment.active) return false;
      return newStart < fragment.end && newEnd > fragment.start;
    });
  };

  const addFragment = () => {
    try {
      const [resultFragments, addedId] = addTimelineFragment(
        fragments,
        currentSelection,
      );
      setFragments(resultFragments);
      setSelectedFragment({
        id: addedId,
        mode: 'edit',
      });
      onFragmentsChange && onFragmentsChange(resultFragments);
    } catch (error) {
      console.error(error);
      return;
    }
  };

  const removeFragment = (id) => {
    const resultFragments = removeTimelineFragment(fragments, id);
    setFragments(resultFragments);
    onFragmentsChange && onFragmentsChange(resultFragments);
    onFragmentDelete && onFragmentDelete(id);
  };

  // Проверяем, пересекается ли текущий выбор с существующими активными фрагментами
  const [newStart, newEnd] = currentSelection;
  const addButtonDisabled =
    newStart >= newEnd || isOverlapping(newStart, newEnd);

  return (
    <div
      className={`fragments-container flex flex-col h-full mode-${widgetMode}`}
    >
      {widgetMode === 'edit' && (
        <div className="mb-4">
          <div className="timeline relative">
            <BgFragments
              fragments={fragments}
              duration={duration}
              onClick={(fragment) => {
                const { start, end } = fragment;
                setCurrentSelection([start, end]);
                if (fragment.active) {
                  if (fragment.id === selectedFragment?.id) {
                    setSelectedFragment(null);
                  } else {
                    setSelectedFragment({
                      id: fragment.id,
                      mode: 'view',
                    });
                  }
                }
              }}
            />
            <Slider
              range
              min={0}
              max={duration}
              step={1}
              value={currentSelection}
              onChange={handleSliderChange}
              tooltip={{
                formatter: getFormattedDuration,
              }}
              onAfterChange={(value) => {
                setCurrentSelection(value);
              }}
            />
            {duration > 0 && progress > 0 && (
              <div
                className="timeline-playhead"
                style={{
                  left: `${Math.min(progress / duration, 1) * 100}%`,
                }}
              />
            )}
          </div>

          <div className="flex gap-2">
            <button
              className="icon-button mt-2"
              data-test-id={TID.timeline.play}
              onClick={togglePlay}
            >
              {playing ? <FiPause /> : <FiPlay />}
            </button>
            <button
              className={
                'icon-button mt-2' + (addButtonDisabled ? ' disabled' : '')
              }
              data-test-id={TID.timeline.add}
              onClick={addFragment}
            >
              <FiPlus />
            </button>
            <div className="flex justify-between mt-2 flex-1">
              {/* <div>Start: {getFormattedDuration(currentSelection[0])}</div> */}
              <div className="flex items-center gap-2">
                Start:{' '}
                <EditablePoint
                  name="start"
                  minValue={0}
                  maxValue={currentSelection[1]}
                  value={currentSelection[0]}
                  onChange={(value) =>
                    setCurrentSelection([value, currentSelection[1]])
                  }
                />
              </div>
              <div className="flex items-center gap-2">
                End:{' '}
                <EditablePoint
                  name="end"
                  minValue={currentSelection[0]}
                  maxValue={duration}
                  value={currentSelection[1]}
                  onChange={(value) =>
                    setCurrentSelection([currentSelection[0], value])
                  }
                />
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="flex-1 overflow-y-auto pt-2 pl-2">
        <Timeline
          onClick={(e) => {
            if (e.target.classList.contains('ant-timeline-item-head')) {
              const fragmentId = e.target
                .closest('.ant-timeline-item')
                .querySelector('.editable-fragment, .inactive-fragment')
                .getAttribute('data-id');
              if (fragmentId) {
                const fragment = fragments.find(({ id }) => id === +fragmentId);
                if (fragment) {
                  const { start, end } = fragment;
                  setCurrentSelection([start, end]);
                  if (fragment.active) {
                    if (fragment.id === selectedFragment?.id) {
                      setSelectedFragment(null);
                    } else {
                      setSelectedFragment({
                        id: fragment.id,
                        mode: 'view',
                      });
                    }
                  } else {
                    setSelectedFragment(null);
                  }
                }
              }
            }
          }}
          items={fragmentsToShow.map((fragment) =>
            fragment.active
              ? {
                  key: fragment.id,
                  children: (
                    <EditableFragment
                      turnId={turnId}
                      withLine={dQuotesWithLines[fragment.id]}
                      isCurrent={fragment.id === currentFragmentId}
                      widgetMode={widgetMode}
                      modeInfo={
                        fragment.id === selectedFragment?.id
                          ? selectedFragment
                          : null
                      }
                      setModeInfo={(newModeInfo) => {
                        setSelectedFragment(newModeInfo);
                        if (newModeInfo) {
                          const { start, end } = fragment;
                          setCurrentSelection([start, end]);
                        }
                        if (
                          widgetMode === 'view' &&
                          newModeInfo?.mode === 'view'
                        ) {
                          toggleQuoteClicked(fragment.id);
                        }
                      }}
                      fragment={fragment}
                      onChange={(fragment) => {
                        const updatedFragments = [...fragments];
                        updatedFragments[
                          fragments.findIndex(({ id }) => id === fragment.id)
                        ] = fragment;
                        setFragments(updatedFragments);
                        onFragmentsChange &&
                          onFragmentsChange(updatedFragments);
                      }}
                      onDelete={(id) => removeFragment(id)}
                    />
                  ),
                }
              : {
                  key: fragment.id,
                  children: <InactiveFragment fragment={fragment} />,
                },
          )}
        />
      </div>
    </div>
  );
};

export default FragmentEditor;
