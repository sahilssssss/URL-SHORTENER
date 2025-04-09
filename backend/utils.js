const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function encodeBase62(num) {
    let base62 = '';
    while (num > 0) {
        base62 = characters[num % 62] + base62;
        num = Math.floor(num / 62);
    }
    return base62 || 'a';  // fallback if num = 0
}

module.exports = { encodeBase62 };

