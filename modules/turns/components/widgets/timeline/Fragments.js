import React, { useState, useEffect, useMemo } from 'react';
import { Input, Popconfirm } from 'antd';
import { getFormattedDuration } from '../../helpers/formatters/player';
import { FiEdit, FiTrash } from 'react-icons/fi';

export const InactiveFragment = ({ fragment, onClick = () => {} }) => {
  return (
    <div
      className="pl-1 inactive-fragment"
      data-id={fragment.id}
      onClick={() => onClick(fragment)}
    >
      <span className="range-text">{getFormattedDuration(fragment.start)}</span>
    </div>
  );
};

export const EditableFragment = ({
  withLine = false,
  fragment,
  onChange = (fragment) => {},
  onDelete = (id) => {},
  modeInfo = null,
  setModeInfo = () => {},
  widgetMode,
}) => {
  // const [mode, setMode] = useState('view');
  const { mode, id: selectedFragmentId } = useMemo(() => {
    if (!modeInfo) return { mode: 'view' };
    return modeInfo;
  }, [modeInfo]);
  const [value, setValue] = useState(fragment.text);

  useEffect(() => {
    setValue(fragment.text);
  }, [fragment.text]);

  return (
    <div
      className={`editable-fragment flex items-start gap-2 ${selectedFragmentId ? 'selected' : ''}`}
      data-id={fragment.id}
    >
      <div className="flex flex-1 gap-2 items-start">
        <div className="flex flex-col gap-1 w-full">
          <span className="pl-1 range-text">
            {getFormattedDuration(fragment.start)}
            {/* -{' '}
            {getFormattedDuration(fragment.end)} */}
          </span>
          <div
            className={
              `fragment-rect h-6 flex gap-2` +
              (withLine ? ' fragment-with-line' : '')
            }
          >
            {mode === 'edit' ? (
              <>
                <Input
                  value={value}
                  autoFocus
                  size="small"
                  onChange={(e) => setValue(e.target.value)}
                  className="fragment-input flex-1"
                  onPressEnter={() => {
                    onChange({
                      ...fragment,
                      text: value,
                    });
                    // setMode('view');
                    setModeInfo({
                      id: fragment.id,
                      mode: 'view',
                    });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setModeInfo({
                        id: fragment.id,
                        mode: 'view',
                      });
                    }
                  }}
                />
                <button
                  className="icon-button inline-block"
                  onClick={() => {
                    onChange({
                      ...fragment,
                      text: value,
                    });
                    // setMode('view');
                    setModeInfo({
                      id: fragment.id,
                      mode: 'view',
                    });
                  }}
                >
                  Ok
                </button>
              </>
            ) : (
              <div className="text-with-buttons h-full cursor-pointer flex gap-2 items-center">
                <span
                  className="pl-1"
                  onClick={() =>
                    setModeInfo({
                      id: fragment.id,
                      mode: 'view',
                    })
                  }
                  title={fragment.text}
                >
                  {fragment.text}
                </span>
                {widgetMode === 'edit' && (
                  <>
                    <button
                      className="icon-button inline-block"
                      onClick={() =>
                        setModeInfo({
                          id: fragment.id,
                          mode: 'edit',
                        })
                      }
                    >
                      <FiEdit />
                    </button>
                    <Popconfirm
                      title="Are you sure you want to delete this fragment?"
                      onConfirm={() => onDelete(fragment.id)}
                    >
                      <button
                        className="icon-button"
                        // onClick={() => onDelete(fragment.id)}
                      >
                        <FiTrash />
                      </button>
                    </Popconfirm>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
