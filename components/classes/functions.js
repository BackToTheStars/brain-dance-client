export const getNextId = (classes) => {
  let max = 1;
  for (const classItem of classes) {
    if (classItem.id > max) {
      max = classItem.id;
    }
  }
  return max + 1;
};
