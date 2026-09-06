'use client';
import { useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AimOutlined } from '@ant-design/icons';
import { Button, Input, Switch, Tooltip } from 'antd';

import { CAST_VIEWPORT, STATUS_ONLINE, TOUR_PARAM } from '@/config/presence';
import { TID } from '@/config/testIds';
import { ROLE_GAME_OWNER, ROLE_GAME_PLAYER, ROLES } from '@/config/user';
import { useUserContext } from '@/modules/user/contexts/UserContext';
import {
  castViewport,
  follow,
  setCursorSharing,
  setEraser,
  setGroupOnMinimap,
  setLead,
  setOnline,
  setPencil,
} from '../redux/actions';

const roleName = (role) => ROLES[role]?.name || `Role ${role}`;

// Who is online in this game, and the tour: the left column is the list, the
// right one is either the guide's own controls or what a follower sees. The
// panel is movable: jQuery UI draggable on the panel wrapper, the same recipe
// as TurnInfo. Its position is not remembered.
const PresencePanel = () => {
  const dispatch = useDispatch();
  const status = useSelector((state) => state.presence.status);
  const sid = useSelector((state) => state.presence.sid);
  const members = useSelector((state) => state.presence.members);
  const error = useSelector((state) => state.presence.error);
  const cursorSharing = useSelector((state) => state.presence.cursorSharing);
  const pencil = useSelector((state) => state.presence.pencil);
  const eraser = useSelector((state) => state.presence.eraser);
  const groupOnMinimap = useSelector((state) => state.presence.groupOnMinimap);
  const tourEnded = useSelector((state) => state.presence.tourEnded);
  const hash = useSelector((state) => state.game.game?.hash);
  const { info } = useUserContext();

  const ref = useRef();
  const linkRef = useRef();
  useEffect(() => {
    if (!ref.current) return;
    if (typeof $ === 'undefined') return;
    const el = $(ref.current.parentNode);
    el.draggable();
    return () => el.draggable('destroy');
  }, []);

  const online = status === STATUS_ONLINE;
  const me = members.find((member) => member.sid === sid) || null;
  const iLead = Boolean(me?.leader);
  const myTour = me?.tour || null;
  const following = me?.following || null;
  // The guide of the tour I am on. Missing while the guide is away: the tour
  // itself is still there, waiting for them to come back.
  const guide = following
    ? members.find((member) => member.tour === following) || null
    : null;
  const followersCount = myTour
    ? members.filter((member) => member.following === myTour).length
    : 0;
  // Only the owner and players run a tour — the server refuses anyone else, so
  // a visitor is not offered the button at all.
  const canLead = [ROLE_GAME_OWNER, ROLE_GAME_PLAYER].includes(info?.role);

  const tourLink = useMemo(() => {
    if (!myTour || !hash) return '';
    const origin = typeof window === 'undefined' ? '' : window.location.origin;
    return `${origin}/game/view/${hash}?${TOUR_PARAM}=${myTour}`;
  }, [myTour, hash]);

  // The clipboard is not there in an insecure context and may be refused: then
  // the field is selected, so that the link can still be copied by hand.
  const copyTourLink = () => {
    if (!tourLink) return;
    const selectField = () => linkRef.current?.select?.();
    if (!navigator?.clipboard?.writeText) {
      selectField();
      return;
    }
    navigator.clipboard.writeText(tourLink).catch(selectField);
  };

  return (
    <div ref={ref} className="p-3" data-test-id={TID.presence.panel}>
      {error && (
        <div className="pb-2 text-red-300" data-test-id={TID.presence.error}>
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <div className="w-1/2 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2">
            <span>
              Status:{' '}
              <b data-test-id={TID.presence.status} data-status={status}>
                {status}
              </b>
            </span>
            <span>{info.nickname}</span>
          </div>

          <ul className="m-0 list-none border-t border-gray-500 p-0">
            {members.map((member) => {
              const isMe = member.sid === sid;
              const followed = !!following && following === member.tour;
              return (
                <li
                  key={member.sid}
                  className="flex flex-wrap items-center gap-x-2 border-b border-gray-500 py-1"
                  data-test-id={TID.presence.member}
                  data-sid={member.sid}
                  data-nickname={member.nickname}
                  data-leader={member.leader ? 'true' : 'false'}
                  data-tour={member.tour || ''}
                  data-following={member.following || ''}
                >
                  <span className="truncate font-bold">{member.nickname}</span>
                  <span className="opacity-70">{roleName(member.role)}</span>
                  {member.leader && (
                    <span className="rounded bg-blue-500 px-1 text-xs text-white">
                      guide
                    </span>
                  )}
                  {isMe && <span className="opacity-70">(you)</span>}
                  {member.leader && !isMe && (
                    <Button
                      size="small"
                      className="ml-auto"
                      disabled={!online || iLead}
                      onClick={() =>
                        dispatch(follow(followed ? null : member.tour))
                      }
                      data-test-id={TID.presence.follow}
                      data-tour={member.tour || ''}
                    >
                      {followed ? 'Leave the tour' : 'Join the tour'}
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="w-1/2 min-w-0">
          {iLead ? (
            <div data-test-id={TID.presence.guide}>
              <div className="flex items-center gap-2 pb-2">
                <Tooltip title="Bring everyone to me">
                  <Button
                    size="small"
                    icon={<AimOutlined />}
                    disabled={!online}
                    onClick={() => dispatch(castViewport())}
                    data-test-id={TID.presence.cast(CAST_VIEWPORT)}
                  />
                </Tooltip>
                <span
                  data-test-id={TID.presence.followers}
                  data-count={followersCount}
                >
                  {followersCount}{' '}
                  {followersCount === 1 ? 'follower' : 'followers'}
                </span>
              </div>

              <div className="pb-2">
                <div className="pb-1">Tour link</div>
                <div className="flex items-center gap-2">
                  <Input
                    size="small"
                    readOnly
                    ref={linkRef}
                    value={tourLink}
                    className="min-w-0 flex-1"
                    data-test-id={TID.presence.tourLink}
                  />
                  <Button
                    size="small"
                    onClick={copyTourLink}
                    data-test-id={TID.presence.tourCopy}
                  >
                    Copy
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2 pb-2">
                <span>Show my cursor</span>
                <Switch
                  size="small"
                  checked={cursorSharing}
                  disabled={!online}
                  onChange={(on) => dispatch(setCursorSharing(on))}
                  data-test-id={TID.presence.cursor}
                />
              </div>

              <div className="flex items-center gap-2 pb-2">
                <span>Pencil</span>
                <Switch
                  size="small"
                  checked={pencil}
                  disabled={!online}
                  onChange={(on) => dispatch(setPencil(on))}
                  data-test-id={TID.presence.pencil}
                />
                <span className="pl-2">Eraser</span>
                <Switch
                  size="small"
                  checked={eraser}
                  disabled={!online || !pencil}
                  onChange={(on) => dispatch(setEraser(on))}
                  data-test-id={TID.presence.eraser}
                />
              </div>

              <div className="flex items-center gap-2 pb-2">
                <span>Show the group on the minimap</span>
                <Switch
                  size="small"
                  checked={groupOnMinimap}
                  disabled={!online}
                  onChange={(on) => dispatch(setGroupOnMinimap(on))}
                  data-test-id={TID.presence.group}
                />
              </div>

              <Button
                size="small"
                disabled={!online}
                onClick={() => dispatch(setLead(false))}
                data-test-id={TID.presence.lead}
                data-on="true"
              >
                End the tour
              </Button>
            </div>
          ) : (
            <div data-test-id={TID.presence.follower}>
              <div className="pb-2">Tour</div>
              {canLead && (
                <Button
                  size="small"
                  disabled={!online}
                  onClick={() => dispatch(setLead(true))}
                  data-test-id={TID.presence.lead}
                  data-on="false"
                >
                  Start a tour
                </Button>
              )}
              {!!guide && (
                <div className="flex items-center gap-2 pt-2">
                  <span>
                    You follow <b>{guide.nickname}</b>
                  </span>
                  <Button
                    size="small"
                    disabled={!online}
                    onClick={() => dispatch(follow(null))}
                    data-test-id={TID.presence.unfollow}
                  >
                    Leave the tour
                  </Button>
                </div>
              )}
              {!!following && !guide && (
                <div className="pt-2" data-test-id={TID.presence.guideAway}>
                  Guide is reconnecting…
                </div>
              )}
              {tourEnded && !following && (
                <div className="pt-2" data-test-id={TID.presence.tourEnded}>
                  Tour ended
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="pt-3">
        <Button
          size="small"
          onClick={() => dispatch(setOnline(false))}
          className="px-3 py-2 bg-blue-500 text-white rounded"
          data-test-id={TID.presence.close}
        >
          Close
        </Button>
      </div>
    </div>
  );
};

export default PresencePanel;
