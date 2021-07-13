import { EventNode } from './event';
import * as tokenizer from '../../util/tokenizer';

export class SignalCatchEvent extends EventNode {
  signal = '';

  constructor(id: string, data: string) {
    super(id);
    if (data != '') {
      const t: Array<string> = tokenizer.tokenizePackage(data);
      let i = 0;
      while (i < t.length) {
        const command: string = t[i++];
        if (i < t.length) {
          if (command == 'catch') {
            this.signal = tokenizer.removePackage(t[i++]);
          } else {
            console.error(
              'Parsing error: Signal Catch Event. ID ' +
                id +
                ': Unknown keyword ' +
                command
            );
          }
        } else {
          console.error(
            'Parsing error: Signal Catch Event. ID ' +
              id +
              ': Expecting value for ' +
              command
          );
        }
      }
    }
  }

  toModel(): string {
    let out: string = 'signal_catch_event ' + this.id + ' {\n';
    if (this.signal != '') {
      out += '  catch "' + this.signal + '"\n';
    }
    out += '}\n';
    return out;
  }
}