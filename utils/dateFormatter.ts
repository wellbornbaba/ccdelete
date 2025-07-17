/**
 * Simple date formatter utility
 * 
 * Formats:
 * - 'MMM d, yyyy': 'Jan 1, 2023'
 * - 'MMM d, h:mm a': 'Jan 1, 2:30 PM'
 * - 'EEEE, MMMM d, yyyy': 'Monday, January 1, 2023'
 * - 'h:mm a': '2:30 PM'
 */
export function format(timestamp: number, formatString: string): string {
  const date = new Date(timestamp);
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const shortMonths = months.map(m => m.substring(0, 3));
  
  const days = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday',
    'Thursday', 'Friday', 'Saturday'
  ];
  
  const tokens: { [key: string]: () => string } = {
    'MMMM': () => months[date.getMonth()],
    'MMM': () => shortMonths[date.getMonth()],
    'MM': () => String(date.getMonth() + 1).padStart(2, '0'),
    'M': () => String(date.getMonth() + 1),
    
    'yyyy': () => String(date.getFullYear()),
    'yy': () => String(date.getFullYear()).substring(2),
    
    'EEEE': () => days[date.getDay()],
    'EEE': () => days[date.getDay()].substring(0, 3),
    
    'd': () => String(date.getDate()),
    'dd': () => String(date.getDate()).padStart(2, '0'),
    
    'h': () => String(date.getHours() % 12 || 12),
    'hh': () => String(date.getHours() % 12 || 12).padStart(2, '0'),
    'H': () => String(date.getHours()),
    'HH': () => String(date.getHours()).padStart(2, '0'),
    
    'm': () => String(date.getMinutes()),
    'mm': () => String(date.getMinutes()).padStart(2, '0'),
    
    's': () => String(date.getSeconds()),
    'ss': () => String(date.getSeconds()).padStart(2, '0'),
    
    'a': () => date.getHours() < 12 ? 'AM' : 'PM',
  };
  
  // Order matters - we need to replace longer tokens first
  const tokenKeys = Object.keys(tokens).sort((a, b) => b.length - a.length);
  
  let result = formatString;
  
  tokenKeys.forEach(token => {
    if (result.includes(token)) {
      result = result.replace(new RegExp(token, 'g'), tokens[token]());
    }
  });
  
  return result;
}