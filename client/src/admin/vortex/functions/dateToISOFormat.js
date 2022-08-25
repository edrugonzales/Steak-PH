
/**
 * 
 * @param {*} dateString formatted as m/d/yyyy
 */
export default function ({ dateString }) {


  function padTo2Digits(num) {
    return num.toString().padStart(2, '0');
  }

  const [month, date, year] = dateString.split('/');

  const isoStr = `${year}-${padTo2Digits(month)}-${padTo2Digits(
    date,
  )}T00:00:00.000Z`;

  return isoStr
} 