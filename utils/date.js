export function getWeek(date) {
  const tempDate = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );

  const dayNum = tempDate.getUTCDay() || 7;
  tempDate.setUTCDate(tempDate.getUTCDate() + 4 - dayNum);

  const yearStart = new Date(Date.UTC(tempDate.getUTCFullYear(), 0, 1));

  return Math.ceil(((tempDate - yearStart) / 86400000 + 1) / 7);
}
