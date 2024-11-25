const getIncId = () => Math.floor(new Date().getTime() / 1000) + 1;

export const getDefaultFragments = (duration) => {
  return [
    {
      id: getIncId(),
      start: 0,
      end: duration,
      text: '',
      active: false,
    },
  ];
};

export const addTimelineFragment = (fragments, selection) => {
  const [newStart, newEnd] = selection;
  const currentFragment = fragments.find((fragment) => {
    if (fragment.active) return false;
    return newStart >= fragment.start && newEnd <= fragment.end;
  });

  if (!currentFragment) {
    throw new Error('Current fragment not found');
  }

  const addedId = getIncId();
  let incId = addedId + 1;
  const { start, end } = currentFragment;

  const newFragments = [];
  if (start === newStart && end === newEnd) {
    // 1. фрагмент полностью совпадает
    newFragments.push({
      id: addedId,
      start: newStart,
      end: newEnd,
      active: true,
    });
  } else if (start < newStart && end > newEnd) {
    // 2. фрагмент внутри существующего
    newFragments.push({
      ...currentFragment,
      // id: currentFragment.id,
      // start: start,
      // active: false,
      end: newStart,
    });
    newFragments.push({
      id: addedId,
      start: newStart,
      end: newEnd,
      text: '',
      active: true,
    });
    newFragments.push({
      id: incId++,
      start: newEnd,
      end: end,
      text: '',
      active: false,
    });
  } else if (start === newStart) {
    // 3. фрагмент совпадает с началом существующего
    newFragments.push({
      id: addedId,
      start: newStart,
      end: newEnd,
      text: '',
      active: true,
    });
    newFragments.push({
      ...currentFragment,
      // id: currentFragment.id,
      // end: end,
      // text: '',
      // active: false,
      start: newEnd,
    });
  } else if (end === newEnd) {
    // 4. фрагмент совпадает с концом существующего
    newFragments.push({
      ...currentFragment,
      // id: currentFragment.id,
      // start: start,
      // text: '',
      // active: false,
      end: newStart,
    });
    newFragments.push({
      id: addedId,
      start: newStart,
      end: newEnd,
      text: '',
      active: true,
    });
  }

  let resultFragments = fragments.filter(
    (fragment) => fragment.id !== currentFragment.id,
  );
  resultFragments = resultFragments.concat(newFragments);
  resultFragments.sort((a, b) => a.start - b.start);

  return [resultFragments, addedId];
};

export const removeTimelineFragment = (fragments, id) => {
  const index = fragments.findIndex((fragment) => fragment.id === id);
  if (index === -1) return fragments;
  if (!fragments[index].active) return fragments;
  let newStart = fragments[index].start;
  let newEnd = fragments[index].end;
  const idsToRemove = [id];
  // если слева неактивный фрагмент
  if (index > 0 && !fragments[index - 1].active) {
    newStart = fragments[index - 1].start;
    idsToRemove.push(fragments[index - 1].id);
  }
  // если справа неактивный фрагмент
  if (index < fragments.length - 1 && !fragments[index + 1].active) {
    newEnd = fragments[index + 1].end;
    idsToRemove.push(fragments[index + 1].id);
  }
  let resultFragments = fragments.filter(
    (fragment) => !idsToRemove.includes(fragment.id),
  );
  resultFragments = resultFragments.concat({
    id: getIncId(),
    start: newStart,
    end: newEnd,
    text: '',
    active: false,
  });
  resultFragments.sort((a, b) => a.start - b.start);
  return resultFragments;
};
