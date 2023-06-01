import words from './words';

export class BadWords {
  private static _instance: BadWords;
  private data: Array<string> = (words || []).map((e) => e);

  public static get instance() {
    if (!BadWords._instance) {
      BadWords._instance = new BadWords();
    }
    return BadWords._instance;
  }

  isProfane(content: string) {
    for (let i = 0; i < this.data.length; i++) {
      const keyword = this.data[i].toUpperCase();
      if (content.toUpperCase().includes(keyword.toUpperCase())) {
        console.log('keyword: ', keyword);
        return true;
      }
    }
    return false;
  }

  filter(content: string) {
    const tempImgs: Array<string> = [];
    let result = content;

    // 将图片部分放入临时数组中，以避免待会儿过滤词会匹配到图片内容
    result = result.replace(/!\[.+\]\(.+\)/g, (val) => {
      tempImgs.push(val);
      return '#IMG#';
    });

    // 匹配过滤词并用*替换
    this.data.forEach((keyword) => {
      if (result.toUpperCase().includes(keyword.toUpperCase())) {
        const asterisks: Array<'*'> = [];
        for (let i = 0; i < keyword.length; i++) {
          asterisks.push('*');
        }
        result = result.replace(new RegExp(keyword, 'gi'), asterisks.join(''));
      }
    });

    // 恢复图片
    if (tempImgs.length) {
      result = result.replace(/#IMG#/g, () => <string>tempImgs.shift());
    }
    return result;
  }
}

export const isProfane = (content: string) => {
  if (!content) {
    return false;
  }
  return BadWords.instance.isProfane(content.trim());
};
