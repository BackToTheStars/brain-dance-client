'use client';
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Switch } from 'antd';

import { CAST_VIEWPORT, STATUS_ONLINE } from '@/config/presence';
import { TID } from '@/config/testIds';
import { ROLES } from '@/config/user';
import { useUserContext } from '@/modules/user/contexts/UserContext';
import { castViewport, follow, setLead, setOnline } from '../redux/actions';

const roleName = (role) => ROLES[role]?.name || `Role ${role}`;

// Who is online in this game, leader mode and the one broadcast of this stage.
// The panel is movable: jQuery UI draggable on the panel wrapper, the same
// recipe as TurnInfo. Its position is not remembered.
const PresencePanel = () => {
  const dispatch = useDispatch();
  const status = useSelector((state) => state.presence.status);
  const sid = useSelector((state) => state.presence.sid);
  const members = useSelector((state) => state.presence.members);
  const error = useSelector((state) => state.presence.error);
  const { info } = useUserContext();

  const ref = useRef();
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
  const followingSid = me?.following || null;
  const leader = followingSid
    ? members.find((member) => member.sid === followingSid) || null
    : null;
  const followersCount = sid
    ? members.filter((member) => member.following === sid).length
    : 0;

  return (
    <div ref={ref} className="p-3" data-test-id={TID.presence.panel}>
      <div className="flex items-center justify-between gap-3 pb-2">
        <span>
          Status:{' '}
          <b data-test-id={TID.presence.status} data-status={status}>
            {status}
          </b>
        </span>
        <span>{info.nickname}</span>
      </div>

      {error && (
        <div className="pb-2 text-red-300" data-test-id={TID.presence.error}>
          {error}
        </div>
      )}

      <div className="flex items-center gap-3 pb-2">
        <span>Leader mode:</span>
        <Switch
          size="small"
          checked={iLead}
          disabled={!online}
          onChange={(on) => dispatch(setLead(on))}
          data-test-id={TID.presence.lead}
        />
        {iLead && (
          <>
            <Button
              size="small"
              disabled={!online}
              onClick={() => dispatch(castViewport())}
              data-test-id={TID.presence.cast(CAST_VIEWPORT)}
            >
              Bring everyone to me
            </Button>
            <span
              data-test-id={TID.presence.followers}
              data-count={followersCount}
            >
              {followersCount} {followersCount === 1 ? 'follower' : 'followers'}
            </span>
          </>
        )}
      </div>

      {leader && (
        <div className="flex items-center gap-3 pb-2">
          <span>
            You follow <b>{leader.nickname}</b>
          </span>
          <Button
            size="small"
            disabled={!online}
            onClick={() => dispatch(follow(null))}
            data-test-id={TID.presence.unfollow}
          >
            Unfollow
          </Button>
        </div>
      )}

      <ul className="m-0 list-none border-t border-gray-500 p-0">
        {members.map((member) => {
          const isMe = member.sid === sid;
          const followed = followingSid === member.sid;
          return (
            <li
              key={member.sid}
              className="flex items-center gap-2 border-b border-gray-500 py-1"
              data-test-id={TID.presence.member}
              data-sid={member.sid}
              data-nickname={member.nickname}
              data-leader={member.leader ? 'true' : 'false'}
              data-following={member.following || ''}
            >
              <span className="font-bold">{member.nickname}</span>
              <span className="opacity-70">{roleName(member.role)}</span>
              {member.leader && (
                <span className="rounded bg-blue-500 px-1 text-xs text-white">
                  leader
                </span>
              )}
              {isMe && <span className="opacity-70">(you)</span>}
              {member.leader && !isMe && (
                <Button
                  size="small"
                  className="ml-auto"
                  disabled={!online || iLead}
                  onClick={() => dispatch(follow(followed ? null : member.sid))}
                  data-test-id={TID.presence.follow}
                  data-sid={member.sid}
                >
                  {followed ? 'Unfollow' : 'Follow'}
                </Button>
              )}
            </li>
          );
        })}
      </ul>

      <div className="pt-3">
        <Button
          size="small"
          onClick={() => dispatch(setOnline(false))}
          className="px-3 py-2 bg-blue-500 text-white rounded"
        >
          Close
        </Button>
      </div>
    </div>
  );
};

export default PresencePanel;
