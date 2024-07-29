const dayjs = require("dayjs");
const { setTimeout } = require("timers/promises");
actionParameters.ExecutionResult = SUCCESS;

// Helper functions
function dayOftheYear(date) {
  const myDate = new Date(date);
  const year = myDate.getFullYear();
  const firstJan = new Date(year, 0, 1);
  const differenceInMillieSeconds = myDate - firstJan;
  return Math.floor(differenceInMillieSeconds / (1000 * 60 * 60 * 24) + 1);
}

// pass in any date as parameter anyDateInMonth
function daysInMonth(anyDateInMonth) {
  return new Date(anyDateInMonth.getFullYear(), anyDateInMonth.getMonth() + 1, 0).getDate();
}

function weekOfTheMonth(date) {
  const startWeekDayIndex = 1; // 1 MonthDay 0 Sundays
  const firstDate = new Date(date.getFullYear(), date.getMonth(), 1);
  const firstDay = firstDate.getDay();

  let weekNumber = Math.ceil((date.getDate() + firstDay) / 7);
  if (startWeekDayIndex === 1) {
    if (date.getDay() === 0 && date.getDate() > 1) weekNumber -= 1;

    if (firstDate.getDate() === 1 && firstDay === 0 && date.getDate() > 1) weekNumber += 1;
  }
  return weekNumber;
}

function getDay(date) {
  // month
  let day = date.getDay();
  if (day === 0) day = 7;
  return day;
}

function tryEncodeDayOfWeekInMonth(Year, Month, WeekNo, WeekDay, date) {
  date.setFullYear(Year);
  date.setMonth(Month);
  let DayCount = 0;
  let result = false;
  let i = 0;
  for (i = 1; i <= daysInMonth(date); i++) {
    date.setDate(i);
    if (getDay(date) === WeekDay) DayCount++;

    if (DayCount === WeekNo) {
      result = true;
      break;
    }
  }
  return result;
}

function increaseDateForPeriod(data, startDate, endDateTime) {
  // No repeat
  if (data.repeatType === "0") return ``;
  while (startDate < endDateTime) {
    // minutes
    if (data.repeatType === "1") {
      startDate.setMinutes(startDate.getMinutes() + data.repeatEvery);
    }
    // Hours
    else if (data.repeatType === "2") {
      startDate.setHours(startDate.getHours() + data.repeatEvery);
    }
  }
}

function setWhenNext(whenNext, whenNextStart, data) {
  if (data.repeatTask === true) {
    whenNext.setHours(whenNextStart.getHours());
    whenNext.setMinutes(whenNextStart.getMinutes());
    whenNext.setSeconds(whenNextStart.getSeconds());
  } else {
    whenNext.setHours(data.startAt.getHours());
    whenNext.setMinutes(data.startAt.getMinutes());
    whenNext.setSeconds(data.startAt.getSeconds());
  }
}

function getNextExecution(data) {
  let result = data.startAt;
  const now = new Date();
  const whenNextStartOriginal = new Date();
  let whenNextStart = new Date();
  const whenNextEnd = new Date();
  let whenNext = new Date();
  let tmp = 0;
  const WeekDays = [data.mon, data.tue, data.wed, data.thu, data.fri, data.sat, data.sun];
  const Months = [data.jan, data.feb, data.mar, data.apr, data.may, data.jun, data.jul, data.aug, data.sep, data.oct, data.nov, data.dec];
  let i = 0;

  if (data.enabled === false) throw new Error("Not enabled");

  // Repeat is very important
  if (data.startAt > now && data.repeatTask === false) return result;

  // ATTENTION
  if (data.useEndDate && data.endDate < now) throw new Error("Beyond end date");

  if (data.repeatTask === true) {
    whenNextStartOriginal.setHours(data.startAt.getHours(), data.startAt.getMinutes(), data.startAt.getSeconds(), 0);
    whenNextStart.setHours(data.repeatStart.getHours(), data.repeatStart.getMinutes(), data.repeatStart.getSeconds(), 0);
    whenNextEnd.setHours(data.repeatUntil.getHours(), data.repeatUntil.getMinutes(), data.repeatUntil.getSeconds(), 0);

    // up to start
    increaseDateForPeriod(data, whenNextStartOriginal, whenNextStart);

    // up to now
    increaseDateForPeriod(data, whenNextStartOriginal, now);

    // Ups next day
    if (whenNextStartOriginal > whenNextEnd) {
      whenNextStart.setDate(whenNextStart.getDate() + 1);
      // Doing up to start again
      increaseDateForPeriod(data, whenNextStartOriginal, whenNextStart);
    }

    whenNextStart = whenNextStartOriginal;
  }

  if (data.howOften === "Daily") {
    tmp = dayOftheYear(now) - 1;
    if (data.every == 0) data.every = 1; // otherwise it will newer finish
    while (tmp % data.every != 0) {
      tmp++;
    }
    whenNext.setFullYear(now.getFullYear());
    whenNext.setMonth(0); // 0 = January
    whenNext.setDate(1 + tmp);

    setWhenNext(whenNext, whenNextStart, data);
    if (whenNext < now) whenNext.setDate(whenNext.getDate() + data.every);
  }

  if (data.howOften === "Weekly") {
    setWhenNext(whenNext, whenNextStart, data);
    while ((weekOfTheMonth(whenNext) === data.every && WeekDays[getDay(whenNext) - 1] === true && whenNext > now) === false) {
      whenNext.setDate(whenNext.getDate() + 1);
    }
  }

  if (data.howOften === "Monthly") {
    whenNext = data.startAt;
    if (data.monthly_type === "0") {
      // Day of month
      setWhenNext(whenNext, whenNextStart, data);
      while ((whenNext.getDate() === data.every && Months[whenNext.getMonth()] === true && whenNext > now) === false) {
        whenNext.setDate(whenNext.getDate() + 1);
      }
    } else {
      for (i = now.getMonth(); i < 12; i++) {
        // this year
        if (Months[i] === true) {
          if (parseInt(data.weekDay) === 8 && parseInt(data.dayNo) < 5) {
            // first day - forth
            whenNext.setDate(data.dayNo);
            whenNext.setMonth(i);
          } else if (parseInt(data.weekDay) === 8 && parseInt(data.dayNo) === 5) {
            // last day
            whenNext.setMonth(i);
            whenNext.setDate(daysInMonth(whenNext));
          } else if (tryEncodeDayOfWeekInMonth(now.getFullYear(), i, parseInt(data.dayNo), parseInt(data.weekDay), whenNext) === false) {
            tryEncodeDayOfWeekInMonth(now.getFullYear(), i, parseInt(data.dayNo) - 1, parseInt(data.weekDay), whenNext);
          }
          setWhenNext(whenNext, whenNextStart, data);
          if (whenNext > now) {
            break;
          }
        }
      }
      if (whenNext < now) {
        // Next year

        for (i = now.getMonth(); i < 12; i++) {
          if (Months[i] === true) {
            if (parseInt(data.weekDay) === 8 && parseInt(data.dayNo) < 5) {
              // first day - forth
              whenNext.setFullYear(now.getFullYear() + 1);
              whenNext.setDate(parseInt(data.dayNo));
              whenNext.setMonth(i);
            } else if (parseInt(data.weekDay) === 8 && parseInt(data.dayNo) === 5) {
              // last day
              whenNext.setFullYear(now.getFullYear() + 1);
              whenNext.setMonth(i);
              whenNext.setDate(daysInMonth(whenNext));
            } else if (tryEncodeDayOfWeekInMonth(now.getFullYear() + 1, i, parseInt(data.dayNo), parseInt(data.weekDay), whenNext) === false) {
              tryEncodeDayOfWeekInMonth(now.getFullYear() + 1, i, parseInt(data.dayNo) - 1, parseInt(data.weekDay), whenNext);
            }
            setWhenNext(whenNext, whenNextStart, data);
            if (whenNext > now) {
              break;
            }
          }
        }
      }
    }
  }
  return whenNext;
}

try {
  let start_at_date = actionParameters.startAt.substr(0, 10);
  let data = {
    enabled: true,
    startAt: new Date(actionParameters.startAt),
    repeatTask: actionParameters.repeatType != 0,
    repeatType: actionParameters.repeatType,
    repeatEvery: parseInt(actionParameters.repeatEvery),
    repeatStart: new Date(`${start_at_date} ${actionParameters.repeatStart}`),
    repeatUntil: new Date(`${start_at_date} ${actionParameters.repeatUntil}`),
    howOften: "Weekly",
    mon: actionParameters.mon,
    tue: actionParameters.tue,
    wed: actionParameters.wed,
    thu: actionParameters.thu,
    fri: actionParameters.fri,
    sat: actionParameters.sat,
    sun: actionParameters.sun,
    every: parseInt(actionParameters.everyWeek),
    useEndDate: actionParameters.useEndDate === "true",
  };

  if (data.useEndDate) data.endDate = new Date(actionParameters.endDate);

  const startDateTime = getNextExecution(data);
  if (actionParameters.wait === "true") logger.info(`Waiting until: ${dayjs(startDateTime).toISOString()}`);
  let now = new Date();
  let tmp = 0;
  do {
    tmp++;
    // Checking every 10 seconds if user aborted/paused execution
    if (tmp === 10) {
      if (isPaused()) throw new Error("Execution aborted");
      tmp = 0;
    }
    // Every second
    await setTimeout(1000);
    now = new Date();
    if (actionParameters.wait !== "true" && now < startDateTime)
      throw new Error(`Current time: ${dayjs(now).toISOString()} < Start Date Time: ${dayjs(startDateTime).toISOString()}`);
  } while (now < startDateTime);
  logger.info(`Current time: ${dayjs(now).toISOString()}`);
} catch (e) {
  actionParameters.ExecutionResult = ERROR;
  actionParameters.ExecutionMessage = e.message;
  stepExecutionInfo.message = e.message;
  logger.error(e.message);
  logger.error(e.stack.replace(e.message, ""));
}
return actionParameters.ExecutionResult;
