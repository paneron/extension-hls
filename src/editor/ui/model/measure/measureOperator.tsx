import { MeasureDataList, MeasureDataUnit, MTreeNode } from "./unit"

export interface Optype {}

export class BinaryOperator implements Optype {  
  id:string
  op: (a:MTreeNode, b:MTreeNode) => MTreeNode

  constructor(x:string, op: (a:MTreeNode, b:MTreeNode) => MTreeNode) {
    this.id = x
    this.op = op
  }
}

export class ListOperator implements Optype {  
  id:string
  op: (a:MeasureDataList) => MTreeNode

  constructor(x:string, op: (a:MeasureDataList) => MTreeNode) {
    this.id = x
    this.op = op
  }
}

const SumListOp = new ListOperator("sum", (a:MeasureDataList):MTreeNode => {
  let sum = 0
  a.values.forEach((x) => {
    let y = +x
    sum += y    
  })
  return new MeasureDataUnit("sumValue", ""+sum)
})

const MaxListOp = new ListOperator("max", (a:MeasureDataList):MTreeNode => {
  let max = a.values.length>0?+a.values[0]:0
  a.values.forEach((x) => {
    let v = +x
    if (v > max)
    max = v
  }) 
  return new MeasureDataUnit("maxValue", ""+max)
})

const MinListOp = new ListOperator("min", (a:MeasureDataList):MTreeNode => {
  let min = a.values.length>0?+a.values[0]:0
  a.values.forEach((x) => {
    let v = +x
    if (v < min)
    min = v
  }) 
  return new MeasureDataUnit("minValue", ""+min)
})

const PlusOp = new BinaryOperator("+", (a:MTreeNode, b:MTreeNode): MTreeNode => {
  let sum = 0
  if (a instanceof MeasureDataUnit && b instanceof MeasureDataUnit) {
    let x = +a.value
    let y = +b.value
    sum = x+y
    return new MeasureDataUnit("addedValue", ""+sum)
  } else if (a instanceof MeasureDataList && b instanceof MeasureDataUnit) {
    let ret:Array<string> = []
    let v = +b.value
    for (let x of a.values) {
      let s = +x + v
      ret.push("" + s)
    }
    return new MeasureDataList("addedValues", ret)
  } else if (a instanceof MeasureDataUnit && b instanceof MeasureDataList) {
    let ret:Array<string> = []
    let v = +a.value
    for (let x of b.values) {
      let s = +x + v
      ret.push("" + s)
    }
    return new MeasureDataList("addedValues", ret)
  } else if (a instanceof MeasureDataList && b instanceof MeasureDataList) {
    let max = a.values.length > b.values.length?a.values.length:b.values.length
    let ret:Array<string> = []
    for (let i = 0;i < max;i++) {
      let x = +a.values[i%a.values.length]
      let y = +b.values[i%b.values.length]
      let s = x + y
      ret.push("" + s)
    }
    return new MeasureDataList("addedValues", ret)
  }    
  return new MeasureDataUnit("sumValue", ""+sum)
})

const MinusOp = new BinaryOperator("-", (a:MTreeNode, b:MTreeNode): MTreeNode => {
  let result = 0
  if (a instanceof MeasureDataUnit && b instanceof MeasureDataUnit) {
    let x = +a.value
    let y = +b.value
    result = x - y
    return new MeasureDataUnit("result", ""+result)
  } else if (a instanceof MeasureDataList && b instanceof MeasureDataUnit) {
    let ret:Array<string> = []
    let v = +b.value
    for (let x of a.values) {
      let s = +x - v
      ret.push("" + s)
    }
    return new MeasureDataList("result", ret)
  } else if (a instanceof MeasureDataUnit && b instanceof MeasureDataList) {
    let ret:Array<string> = []
    let v = +a.value
    for (let x of b.values) {
      let s = v - (+x)
      ret.push("" + s)
    }
    return new MeasureDataList("result", ret)
  } else if (a instanceof MeasureDataList && b instanceof MeasureDataList) {
    let max = a.values.length > b.values.length?a.values.length:b.values.length
    let ret:Array<string> = []
    for (let i = 0;i < max;i++) {
      let x = +a.values[i%a.values.length]
      let y = +b.values[i%b.values.length]
      let s = x - y
      ret.push("" + s)
    }
    return new MeasureDataList("result", ret)
  }    
  return new MeasureDataUnit("result", ""+result)
})

const MulOp = new BinaryOperator("*", (a:MTreeNode, b:MTreeNode): MTreeNode => {
  let result = 0
  if (a instanceof MeasureDataUnit && b instanceof MeasureDataUnit) {
    let x = +a.value
    let y = +b.value
    result = x * y
    return new MeasureDataUnit("result", ""+result)
  } else if (a instanceof MeasureDataList && b instanceof MeasureDataUnit) {
    let ret:Array<string> = []
    let v = +b.value
    for (let x of a.values) {
      let s = +x * v
      ret.push("" + s)
    }
    return new MeasureDataList("result", ret)
  } else if (a instanceof MeasureDataUnit && b instanceof MeasureDataList) {
    let ret:Array<string> = []
    let v = +a.value
    for (let x of b.values) {
      let s = +x * v
      ret.push("" + s)
    }
    return new MeasureDataList("result", ret)
  } else if (a instanceof MeasureDataList && b instanceof MeasureDataList) {
    let max = a.values.length > b.values.length?a.values.length:b.values.length
    let ret:Array<string> = []
    for (let i = 0;i < max;i++) {
      let x = +a.values[i%a.values.length]
      let y = +b.values[i%b.values.length]
      let s = x * y
      ret.push("" + s)
    }
    return new MeasureDataList("result", ret)
  }    
  return new MeasureDataUnit("result", ""+result)
})

const DivideOp = new BinaryOperator("/", (a:MTreeNode, b:MTreeNode): MTreeNode => {
  let result = 0
  if (a instanceof MeasureDataUnit && b instanceof MeasureDataUnit) {
    let x = +a.value
    let y = +b.value
    result = x/y
    return new MeasureDataUnit("result", ""+result)
  } else if (a instanceof MeasureDataList && b instanceof MeasureDataUnit) {
    let ret:Array<string> = []
    let v = +b.value
    for (let x of a.values) {
      let s = +x / v
      ret.push("" + s)
    }
    return new MeasureDataList("result", ret)
  } else if (a instanceof MeasureDataUnit && b instanceof MeasureDataList) {
    let ret:Array<string> = []
    let v = +a.value
    for (let x of b.values) {
      let s = v / (+x)
      ret.push("" + s)
    }
    return new MeasureDataList("result", ret)
  } else if (a instanceof MeasureDataList && b instanceof MeasureDataList) {
    let max = a.values.length > b.values.length?a.values.length:b.values.length
    let ret:Array<string> = []
    for (let i = 0;i < max;i++) {
      let x = +a.values[i%a.values.length]
      let y = +b.values[i%b.values.length]
      let s = x / y
      ret.push("" + s)
    }
    return new MeasureDataList("result", ret)
  }    
  return new MeasureDataUnit("result", ""+result)
})

function initOperators():Map<string, Optype> {
  let map = new Map<string, Optype>()
  let array = [SumListOp, MaxListOp, MinListOp, PlusOp, DivideOp, MinusOp, MulOp]
  array.forEach((x) => {
    map.set(x.id, x)
  })  
  return map
}

export const MeasurementOperators = initOperators()