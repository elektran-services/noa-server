const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const timeToMinutes = (time) => {
  const [hours, minutes] = String(time || '00:00').split(':').map(Number);
  return (hours * 60) + minutes;
};

const isOvernight = (start, end) => timeToMinutes(start) >= timeToMinutes(end);

const isProgramOnAir = (program, currentDay, previousDay, currentMinutes) => {
  if (!program || !program.duration) return false;

  const start = timeToMinutes(program.duration.start);
  const end = timeToMinutes(program.duration.end);
  const overnight = start >= end;
  const days = Array.isArray(program.days) ? program.days : [];

  if (!overnight && days.includes(currentDay)) {
    return currentMinutes >= start && currentMinutes < end;
  }

  if (!overnight) return false;

  // Overnight program is active on start day from start..24:00
  if (days.includes(currentDay) && currentMinutes >= start) {
    return true;
  }

  // ...and carries into the following day from 00:00..end
  if (days.includes(previousDay) && currentMinutes < end) {
    return true;
  }

  return false;
};

const findNowOnAir = (programs, now = new Date()) => {
  const currentDayIndex = now.getDay();
  const currentDay = DAYS_OF_WEEK[currentDayIndex];
  const previousDay = DAYS_OF_WEEK[(currentDayIndex + 6) % 7];
  const currentMinutes = (now.getHours() * 60) + now.getMinutes();

  const matching = (programs || []).filter((program) =>
    isProgramOnAir(program, currentDay, previousDay, currentMinutes)
  );

  if (matching.length === 0) return null;

  // Prefer latest start time when overlaps exist.
  matching.sort((a, b) => timeToMinutes(b.duration.start) - timeToMinutes(a.duration.start));
  return matching[0];
};

const getNextStartDelta = (program, now = new Date()) => {
  if (!program || !program.duration || !Array.isArray(program.days) || program.days.length === 0) {
    return Number.POSITIVE_INFINITY;
  }

  const currentDayIndex = now.getDay();
  const currentMinutes = (now.getHours() * 60) + now.getMinutes();
  const startMinutes = timeToMinutes(program.duration.start);
  let bestDelta = Number.POSITIVE_INFINITY;

  for (const day of program.days) {
    const dayIndex = DAYS_OF_WEEK.indexOf(day);
    if (dayIndex < 0) continue;

    let deltaDays = (dayIndex - currentDayIndex + 7) % 7;
    if (deltaDays === 0 && startMinutes <= currentMinutes) {
      deltaDays = 7;
    }

    const totalDeltaMinutes = (deltaDays * 24 * 60) + (startMinutes - currentMinutes);
    if (totalDeltaMinutes < bestDelta) {
      bestDelta = totalDeltaMinutes;
    }
  }

  return bestDelta;
};

const findUpNext = (programs, now = new Date()) => {
  let nextProgram = null;
  let nextDelta = Number.POSITIVE_INFINITY;

  for (const program of programs || []) {
    const delta = getNextStartDelta(program, now);
    if (delta < nextDelta) {
      nextDelta = delta;
      nextProgram = program;
    }
  }

  return Number.isFinite(nextDelta) ? nextProgram : null;
};

module.exports = {
  DAYS_OF_WEEK,
  findNowOnAir,
  findUpNext,
};
