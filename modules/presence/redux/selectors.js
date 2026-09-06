// Selectors of the presence slice for the modules that only need to know
// whether this tab follows a tour and who guides it: the canvas (the follower
// only watches), the cards (no dragging while I follow), the action buttons.
// This file imports nothing, so it is safe to import from anywhere without
// closing a cycle with the game and turns slices — a cycle between those and
// the presence module breaks the production bundle.

const me = (state) => {
  const { sid, members } = state.presence;
  return sid ? members.find((member) => member.sid === sid) || null : null;
};

// The id of the tour I follow, or null. Stays set while the guide is away for
// a break: the tour waits for them and so do I.
export const selectFollowing = (state) => me(state)?.following || null;

// The sid of the guide of the tour I follow: null when I follow nobody, and
// null while the guide is away (their sid is not in the list until they are
// back — with a new one).
export const selectGuideSid = (state) => {
  const following = selectFollowing(state);
  if (!following) return null;
  return (
    state.presence.members.find((member) => member.tour === following)?.sid ||
    null
  );
};

// The id of the tour I guide, or null.
export const selectMyTour = (state) => me(state)?.tour || null;
