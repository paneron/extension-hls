import * as tokenizer from '../../util/tokenizer'

export class Reference {
  id:string = ""
  document:string = "" 
  clause:string = ""  

  constructor(id:string, data:string) {
    this.id = id
    if (data != "") {
      let t:Array<string> = tokenizer.tokenizePackage(data)
      let i:number  = 0
      while (i < t.length) {
        let command:string = t[i++]
        if (i < t.length) {
          if (command == "document") {
            this.document = tokenizer.removePackage(t[i++])
          } else if (command == "clause") {
            this.clause = tokenizer.removePackage(t[i++])
          } else {
            console.error('Parsing error: reference. ID ' + id + ': Unknown keyword ' + command)
          }
        } else {
          console.error('Parsing error: reference. ID ' + id + ': Expecting value for ' + command)
        }
      }
    }
  }

  toModel():string {		
		let out:string = "reference " + this.id + " {\n"
		out += "  document \""+ this.document+"\"\n"
		out += "  clause \""+ this.clause +"\"\n"
		out += "}\n"
		return out
	}	

  toSummary():string {
    if (this.clause == "") {
			return this.document
		}
		return this.document + " (" + this.clause + ")"
  }
}