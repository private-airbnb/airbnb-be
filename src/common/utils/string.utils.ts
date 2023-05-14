export class StringUtils {
  static random(len = 12) {
    let result = '';
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < len; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  static random48() {
    return StringUtils.random(48);
  }

  static removeAllSpaces(value: string): string {
    if (!value) {
      return value;
    }

    return value.split(' ').join('').trim();
  }
}
