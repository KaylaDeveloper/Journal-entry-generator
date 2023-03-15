export function getSmallerDates(date1: string, date2: string) {
  if (date1 === '' && date2 === '') {
    return new Date().toISOString().split('T')[0];
  }
  if (date1 === '') {
    return date2;
  }
  if (date2 === '') {
    return date1;
  }
  if (new Date(date1) < new Date(date2)) {
    return date1;
  } else {
    return date2;
  }
}
export function changeDateFormat(date: string) {
  const dateArray = date.split('-');
  return [dateArray[2], dateArray[1], dateArray[0]].join('/');
}
