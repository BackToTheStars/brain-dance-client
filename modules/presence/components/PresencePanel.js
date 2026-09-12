'use client';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  AimOutlined,
  ArrowsAltOutlined,
  BorderOuterOutlined,
  ClearOutlined,
  CopyOutlined,
  DeleteOutlined,
  DragOutlined,
  EditOutlined,
  LinkOutlined,
  LoginOutlined,
  LogoutOutlined,
  NodeIndexOutlined,
  PlayCircleOutlined,
  PoweroffOutlined,
  ShareAltOutlined,
  ShrinkOutlined,
  StopOutlined,
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
  readPresencePanelCollapsed,
  savePresencePanelCollapsed,
} from '../panelView';
import {
  castViewport,
  follow,
  setCursorSharing,
  setEraser,
  setGroupOnMinimap,
  setLead,
  setLinesOnTop,
  setOnline,
  setPencil,
} from '../redux/actions';

const roleName = (role) => ROLES[role]?.name || `Role ${role}`;

// Tour actions first; the people list opens for choosing a guide and folds
// while on a tour. Only the heading moves the panel, not its controls. Folded,
// the panel keeps the same controls as icons and the same test ids on them.
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
  const linesOnTop = useSelector((state) => state.presence.linesOnTop);
  const tourEnded = useSelector((state) => state.presence.tourEnded);
  const hash = useSelector((state) => state.game.game?.hash);
  const { info } = useUserContext();

  const ref = useRef();
  const linkRef = useRef();
  const id = useId();
  const [peopleOpen, setPeopleOpen] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [collapsed, setCollapsed] = useState(readPresencePanelCollapsed);
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

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    savePresencePanelCollapsed(next);
    if (next) setInviteOpen(false);
  };

  // Folded, a control shows only its icon: the caption is hidden by CSS and its
  // text moves into the tooltip and the accessible name.
  const hint = (label) => (collapsed ? { title: label, 'aria-label': label } : {});

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
    <div
      ref={ref}
      className="presence-panel p-3"
      data-test-id={TID.presence.panel}
      data-collapsed={collapsed ? 'true' : 'false'}
    >
      <div
        className="presence-panel__header flex items-center justify-between gap-3 pb-3"
        data-test-id={TID.presence.status}
        data-status={status}
      >
        <span className="flex items-center gap-2 font-bold">
          <TeamOutlined /> {!collapsed && <span>People &amp; tours</span>}
        </span>
        <span className="flex items-center gap-3">
          <Tooltip title="Drag to move the panel"><DragOutlined /></Tooltip>
          <button
            type="button"
            className="presence-panel__collapse"
            onClick={toggleCollapsed}
            aria-expanded={!collapsed}
            title={collapsed ? 'Expand the panel' : 'Collapse the panel'}
            aria-label={collapsed ? 'Expand the panel' : 'Collapse the panel'}
            data-test-id={TID.presence.collapse}
          >
            {collapsed ? <ArrowsAltOutlined /> : <ShrinkOutlined />}
          </button>
        </span>
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
        <div
          className="presence-panel__controls flex flex-col gap-3"
          data-test-id={TID.presence.guide}
        >
          <div className="presence-panel__group flex items-center justify-between gap-3">
            <div>
              {!collapsed && <div className="font-bold">Your tour</div>}
              <div
                data-test-id={TID.presence.followers}
                data-count={followersCount}
                {...hint(`${followersCount} following me`)}
              >
                {collapsed ? (
                  <><TeamOutlined /> {followersCount}</>
                ) : (
                  `${followersCount} ${followersCount === 1 ? 'follower' : 'followers'}`
                )}
              </div>
            </div>
            <Button
              icon={collapsed ? <StopOutlined /> : undefined}
              disabled={!online}
              onClick={() => dispatch(setLead(false))}
              data-test-id={TID.presence.lead}
              data-on="true"
              {...hint('End tour')}
            >End tour</Button>
          </div>
          <div className="presence-panel__group flex flex-wrap items-center">
            <Tooltip title="Bring everyone to me">
              <Button
                wide
                icon={<AimOutlined />}
                disabled={!online}
                onClick={() => dispatch(castViewport())}
                data-test-id={TID.presence.cast(CAST_VIEWPORT)}
                {...hint('Bring group here')}
              >Bring group here</Button>
            </Tooltip>
            <Button
              icon={<LinkOutlined />}
              aria-expanded={inviteOpen}
              aria-controls={`${id}-invite`}
              onClick={() => { setInviteOpen(!inviteOpen); setCopied(false); }}
              data-test-id={TID.presence.invite}
              {...hint('Invite')}
            >Invite</Button>
          </div>
          <div className="presence-panel__wide" id={`${id}-invite`} hidden={!inviteOpen}>
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
                icon={collapsed ? <CopyOutlined /> : undefined}
                onClick={copyTourLink}
                data-test-id={TID.presence.tourCopy}
                {...hint(copied ? 'Copied' : 'Copy')}
              >
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>

          <div className="presence-panel__group">
            {!collapsed && <div className="pb-2">Drawing</div>}
            <div
              className="presence-panel__group flex flex-wrap"
              role="group"
              aria-label="Drawing tools"
            >
              <Button
                icon={<EditOutlined />}
                aria-pressed={pencil && !eraser}
                disabled={!online}
                onClick={() => selectTool(false)}
                data-test-id={TID.presence.pencil}
                {...hint('Pencil')}
              >Pencil</Button>
              <Button
                icon={<ClearOutlined />}
                aria-pressed={pencil && eraser}
                disabled={!online}
                onClick={() => selectTool(true)}
                data-test-id={TID.presence.eraser}
                {...hint('Eraser')}
              >Eraser</Button>
              {pencil && (
                <Button
                  icon={collapsed ? <DeleteOutlined /> : undefined}
                  disabled={!online}
                  onClick={() => dispatch(setPencil(false))}
                  data-test-id={TID.presence.drawClear}
                  {...hint('Clear & exit')}
                >Clear &amp; exit</Button>
              )}
            </div>
            {!collapsed && (
              <div className="pt-2 text-sm">
                {pencil ? 'Clear & exit removes your strokes for everyone.' : 'Drawing is off.'}
              </div>
            )}
          </div>
          <div className="presence-panel__group flex flex-col gap-2">
            <div className="presence-panel__switch flex items-center gap-2">
              <Switch
                id={`${id}-cursor`}
                size="small"
                checked={cursorSharing}
                disabled={!online}
                onChange={(on) => dispatch(setCursorSharing(on))}
                data-test-id={TID.presence.cursor}
                {...hint('Share cursor')}
              />
              <label htmlFor={`${id}-cursor`}>
                {collapsed ? <ShareAltOutlined /> : 'Share cursor'}
              </label>
            </div>
            <div className="presence-panel__switch flex items-center gap-2">
              <Switch
                id={`${id}-group`}
                size="small"
                checked={groupOnMinimap}
                disabled={!online}
                onChange={(on) => dispatch(setGroupOnMinimap(on))}
                data-test-id={TID.presence.group}
                {...hint('Group on minimap')}
              />
              <label htmlFor={`${id}-group`}>
                {collapsed ? <BorderOuterOutlined /> : 'Group on minimap'}
              </label>
            </div>
          </div>
        </div>
      ) : (
        <div
          className="presence-panel__controls flex flex-col items-start gap-3"
          data-test-id={TID.presence.follower}
        >
          {!collapsed && (
            <div className="font-bold">
              {following ? (guide ? `${guide.nickname}’s tour` : 'Following a tour') : 'You’re exploring'}
            </div>
          )}
          {tourEnded && !following && (
            <div role="status" data-test-id={TID.presence.tourEnded}>Tour ended</div>
          )}
          {!following && canLead && (
            <Button
              icon={collapsed ? <PlayCircleOutlined /> : undefined}
              disabled={!online}
              onClick={() => dispatch(setLead(true))}
              data-test-id={TID.presence.lead}
              data-on="false"
              {...hint('Start a tour')}
            >
              Start a tour
            </Button>
          )}
          {/* Folded, the people list is gone and Join tour would go with it —
              one icon per guide stands in for it, named after that guide. */}
          {collapsed && !following && members
            .filter((member) => member.leader && member.sid !== sid)
            .map((member) => (
              <Button
                key={member.sid}
                icon={<LoginOutlined />}
                disabled={!online}
                onClick={() => dispatch(follow(member.tour))}
                data-test-id={TID.presence.follow}
                data-tour={member.tour || ''}
                title={`Join ${member.nickname}’s tour`}
                aria-label={`Join ${member.nickname}’s tour`}
              >Join tour</Button>
            ))}
          {!!following && (
            <>
              {!guide && online && (
                <div role="status" data-test-id={TID.presence.guideAway}>
                  Guide is reconnecting…
                </div>
              )}
              <Button
                icon={collapsed ? <LogoutOutlined /> : undefined}
                disabled={!online}
                onClick={() => dispatch(follow(null))}
                data-test-id={TID.presence.unfollow}
                {...hint('Leave tour')}
              >
                Leave tour
              </Button>
              <div className="presence-panel__switch flex items-center gap-2">
                <Switch
                  id={`${id}-lines`}
                  size="small"
                  checked={linesOnTop}
                  onChange={(on) => dispatch(setLinesOnTop(on))}
                  data-test-id={TID.presence.linesOnTop}
                  {...hint('Lines on top')}
                />
                <label htmlFor={`${id}-lines`}>
                  {collapsed ? <NodeIndexOutlined /> : 'Lines on top'}
                </label>
              </div>
            </>
          )}
        </div>
      )}

      {!collapsed && (
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
      )}

      <div className="presence-panel__footer mt-3 flex justify-end pt-3">
        <Button
          icon={<PoweroffOutlined />}
          onClick={() => dispatch(setOnline(false))}
          data-test-id={TID.presence.close}
          {...hint('Go offline')}
        >
          Go offline
        </Button>
      </div>
    </div>
  );
};

export default PresencePanel;
