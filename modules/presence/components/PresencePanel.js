'use client';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  AimOutlined,
  ClearOutlined,
  DragOutlined,
  EditOutlined,
  LinkOutlined,
  PoweroffOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { Input, Switch, Tooltip } from 'antd';

import {
  CAST_VIEWPORT,
  STATUS_CONNECTING,
  STATUS_ONLINE,
  STATUS_RECONNECTING,
  TOUR_PARAM,
} from '@/config/presence';
import { TID } from '@/config/testIds';
import { ROLE_GAME_OWNER, ROLE_GAME_PLAYER, ROLES } from '@/config/user';
import { useUserContext } from '@/modules/user/contexts/UserContext';
import Button from '@/modules/panels/components/PanelButton';
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

// Tour actions first; the people list opens for choosing a guide and folds
// while on a tour. Only the heading moves the panel, not its controls.
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
  const id = useId();
  const [peopleOpen, setPeopleOpen] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    if (typeof $ === 'undefined') return;
    const el = $(ref.current.parentNode);
    el.draggable({ handle: '.presence-panel__header', containment: 'window' });
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

  useEffect(() => {
    setPeopleOpen(!iLead && !following);
  }, [iLead, following]);
  useEffect(() => {
    setInviteOpen(false);
    setCopied(false);
  }, [myTour]);

  // Choosing the already active tool is harmless. Only Clear & exit calls
  // setPencil(false), whose existing contract clears the shared strokes.
  const selectTool = (erasing) => {
    if (!online) return;
    if (!pencil) dispatch(setPencil(true));
    if (eraser !== erasing) dispatch(setEraser(erasing));
  };

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
    navigator.clipboard.writeText(tourLink)
      .then(() => setCopied(true))
      .catch(selectField);
  };

  return (
    <div ref={ref} className="presence-panel p-3" data-test-id={TID.presence.panel}>
      <div
        className="presence-panel__header flex items-center justify-between gap-3 pb-3"
        data-test-id={TID.presence.status}
        data-status={status}
      >
        <span className="flex items-center gap-2 font-bold">
          <TeamOutlined /> People &amp; tours
        </span>
        <Tooltip title="Drag to move the panel"><DragOutlined /></Tooltip>
      </div>
      {!online && (
        <div className="pb-3" role="status" data-test-id={TID.presence.connection}>
          {status === STATUS_CONNECTING ? 'Connecting…' :
            status === STATUS_RECONNECTING ? 'Reconnecting…' : 'Connection unavailable'}
        </div>
      )}
      {error && (
        <div className="pb-3 text-red-300" role="alert" data-test-id={TID.presence.error}>
          {error}
        </div>
      )}

      {iLead ? (
        <div className="flex flex-col gap-3" data-test-id={TID.presence.guide}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="font-bold">Your tour</div>
              <div data-test-id={TID.presence.followers} data-count={followersCount}>
                {followersCount} {followersCount === 1 ? 'follower' : 'followers'}
              </div>
            </div>
            <Button
              disabled={!online}
              onClick={() => dispatch(setLead(false))}
              data-test-id={TID.presence.lead}
              data-on="true"
            >End tour</Button>
          </div>
          <div className="flex flex-wrap items-center">
            <Tooltip title="Bring everyone to me">
              <Button
                wide
                icon={<AimOutlined />}
                disabled={!online}
                onClick={() => dispatch(castViewport())}
                data-test-id={TID.presence.cast(CAST_VIEWPORT)}
              >Bring group here</Button>
            </Tooltip>
            <Button
              icon={<LinkOutlined />}
              aria-expanded={inviteOpen}
              aria-controls={`${id}-invite`}
              onClick={() => { setInviteOpen(!inviteOpen); setCopied(false); }}
              data-test-id={TID.presence.invite}
            >Invite</Button>
          </div>
          <div id={`${id}-invite`} hidden={!inviteOpen}>
            <label htmlFor={`${id}-link`} className="block pb-1">Tour link</label>
            <div className="flex items-center">
              <Input
                id={`${id}-link`}
                readOnly
                ref={linkRef}
                value={tourLink}
                onFocus={(event) => event.target.select()}
                className="min-w-0 flex-1"
                data-test-id={TID.presence.tourLink}
              />
              <Button
                onClick={copyTourLink}
                data-test-id={TID.presence.tourCopy}
              >
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>

          <div>
            <div className="pb-2">Drawing</div>
            <div className="flex flex-wrap" role="group" aria-label="Drawing tools">
              <Button
                icon={<EditOutlined />}
                aria-pressed={pencil && !eraser}
                disabled={!online}
                onClick={() => selectTool(false)}
                data-test-id={TID.presence.pencil}
              >Pencil</Button>
              <Button
                icon={<ClearOutlined />}
                aria-pressed={pencil && eraser}
                disabled={!online}
                onClick={() => selectTool(true)}
                data-test-id={TID.presence.eraser}
              >Eraser</Button>
              {pencil && (
                <Button
                  disabled={!online}
                  onClick={() => dispatch(setPencil(false))}
                  data-test-id={TID.presence.drawClear}
                >Clear &amp; exit</Button>
              )}
            </div>
            <div className="pt-2 text-sm">
              {pencil ? 'Clear & exit removes your strokes for everyone.' : 'Drawing is off.'}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Switch
                id={`${id}-cursor`}
                size="small"
                checked={cursorSharing}
                disabled={!online}
                onChange={(on) => dispatch(setCursorSharing(on))}
                data-test-id={TID.presence.cursor}
              />
              <label htmlFor={`${id}-cursor`}>Share cursor</label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id={`${id}-group`}
                size="small"
                checked={groupOnMinimap}
                disabled={!online}
                onChange={(on) => dispatch(setGroupOnMinimap(on))}
                data-test-id={TID.presence.group}
              />
              <label htmlFor={`${id}-group`}>Group on minimap</label>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-start gap-3" data-test-id={TID.presence.follower}>
          <div className="font-bold">
            {following ? (guide ? `${guide.nickname}’s tour` : 'Following a tour') : 'You’re exploring'}
          </div>
          {tourEnded && !following && (
            <div role="status" data-test-id={TID.presence.tourEnded}>Tour ended</div>
          )}
          {!following && canLead && (
            <Button
              disabled={!online}
              onClick={() => dispatch(setLead(true))}
              data-test-id={TID.presence.lead}
              data-on="false"
            >
              Start a tour
            </Button>
          )}
          {!!following && (
            <>
              {!guide && online && (
                <div role="status" data-test-id={TID.presence.guideAway}>
                  Guide is reconnecting…
                </div>
              )}
              <Button
                disabled={!online}
                onClick={() => dispatch(follow(null))}
                data-test-id={TID.presence.unfollow}
              >
                Leave tour
              </Button>
            </>
          )}
        </div>
      )}

      <details
        className="presence-panel__people mt-3 pt-3"
        open={peopleOpen}
        onToggle={(event) => setPeopleOpen(event.currentTarget.open)}
        data-test-id={TID.presence.people}
      >
        <summary>People · {members.length}</summary>
        <ul className="m-0 flex list-none flex-col gap-3 p-0 pt-3">
          {members.map((member) => {
            const isMe = member.sid === sid;
            const memberGuide = member.following
              ? members.find((person) => person.tour === member.following)
              : null;
            const tourRole = member.leader
              ? (following === member.tour ? 'Your guide' : 'Tour guide')
              : member.following
                ? (member.following === myTour ? 'Following you' :
                  memberGuide ? `Following ${memberGuide.nickname}` : 'Following a tour')
                : null;
            return (
              <li
                key={member.sid}
                className="flex items-center justify-between gap-3"
                data-test-id={TID.presence.member}
                data-sid={member.sid}
                data-nickname={member.nickname}
                data-leader={member.leader ? 'true' : 'false'}
                data-tour={member.tour || ''}
                data-following={member.following || ''}
              >
                <div className="min-w-0 break-words">
                  <div className="font-bold">{member.nickname}{isMe && ' (you)'}</div>
                  <div className="text-sm">{roleName(member.role)}{tourRole && ` · ${tourRole}`}</div>
                </div>
                {!iLead && !following && member.leader && !isMe && (
                  <Button
                    className="shrink-0"
                    disabled={!online}
                    onClick={() => dispatch(follow(member.tour))}
                    data-test-id={TID.presence.follow}
                    data-tour={member.tour || ''}
                  >Join tour</Button>
                )}
              </li>
            );
          })}
        </ul>
      </details>

      <div className="presence-panel__footer mt-3 flex justify-end pt-3">
        <Button
          icon={<PoweroffOutlined />}
          onClick={() => dispatch(setOnline(false))}
          data-test-id={TID.presence.close}
        >
          Go offline
        </Button>
      </div>
    </div>
  );
};

export default PresencePanel;
