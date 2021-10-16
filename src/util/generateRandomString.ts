const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
export function generateRandomString() {
  return [...Array(10)]
    .map(() => characters.charAt(Math.random() * characters.length))
    .join("");
}
