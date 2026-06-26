export function generateOrderCode(date: Date): string {
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const randomId = Math.floor(Math.random() * 90000) + 10000; // 5-digit random number
  return `SER-${year}${month}${day}-${randomId}`;
}
