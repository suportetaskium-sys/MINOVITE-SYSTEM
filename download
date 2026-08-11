const FIXED_NATIONAL_HOLIDAYS = [
  '01-01',
  '04-21',
  '05-01',
  '09-07',
  '10-12',
  '11-02',
  '11-15',
  '11-20',
  '12-25'
];

function toIsoDate(date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isNationalHoliday(date) {
  const monthDay = toIsoDate(date).slice(5);
  return FIXED_NATIONAL_HOLIDAYS.includes(monthDay);
}

export function isBusinessDay(date) {
  const weekday = date.getUTCDay();
  return weekday !== 0 && weekday !== 6 && !isNationalHoliday(date);
}

export function addBusinessDays(startDate, days) {
  const date = new Date(`${startDate}T12:00:00Z`);
  let added = 0;

  while (added < days) {
    date.setUTCDate(date.getUTCDate() + 1);
    if (isBusinessDay(date)) added += 1;
  }

  return toIsoDate(date);
}
