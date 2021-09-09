import { OpenDialogProps } from '@riboseinc/paneron-extension-kit/types';
import { BufferDataset } from '@riboseinc/paneron-extension-kit/types/buffers';
import { DataType } from '../serialize/interface/baseinterface';
import { VarType } from '../serialize/interface/supportinterface';

export const MODAILITYOPTIONS: Array<string> = [
  '',
  'MUST',
  'SHALL',
  'SHOULD',
  'CAN',
  'MAY',
];

export const DragAndDropFormatType = 'application/MMEL';

export const TimerType = ['', 'WAIT', 'REPEAT'];

export const EMPTYTYPE = '';
export const STRINGTYPE = 'string';
export const BOOLEANTYPE = 'boolean';
export const DATETIMETYPE = 'datetime';
export const ROLETYPE = 'role';

const REPORTSTARTTAGTEXT = 'SMARTScript';
export const REPORTSTARTTAG = `<${REPORTSTARTTAGTEXT}>`;
export const REPORTENDTAG = `</${REPORTSTARTTAGTEXT}>`;

export const DATATYPE = [
  EMPTYTYPE,
  STRINGTYPE,
  BOOLEANTYPE,
  DATETIMETYPE,
  ROLETYPE,
] as const;

export type BASICTYPES = typeof DATATYPE[number];

export const BooleanOptions = ['', 'True', 'False'];

export enum EditAction {
  EDIT = 'edit',
  DELETE = 'delete',
}

export const MEASUREMENTTYPES = [
  VarType.DATA,
  VarType.LISTDATA,
  VarType.DERIVED,
];

export const searchableNodeDataTypes = [
  DataType.PROCESS,
  DataType.APPROVAL,
  DataType.TIMEREVENT,
  DataType.SIGNALCATCHEVENT,
  DataType.EGATE,
] as const;

export type SearchableNodeTypes = typeof searchableNodeDataTypes[number];

export const NewComponents = [
  DataType.PROCESS,
  DataType.APPROVAL,
  DataType.ENDEVENT,
  DataType.TIMEREVENT,
  DataType.SIGNALCATCHEVENT,
  DataType.EGATE,
] as const;

export const DescribableNodes = [
  DataType.PROCESS,
  DataType.APPROVAL,
  DataType.TIMEREVENT,
  DataType.SIGNALCATCHEVENT,
  DataType.DATACLASS,
  DataType.REGISTRY,
  DataType.EGATE,
] as const;

export const SelectableNodes = [
  ...DescribableNodes,
  DataType.ENDEVENT,
  DataType.STARTEVENT,
] as const;

export const EditableNodes = [
  DataType.PROCESS,
  DataType.APPROVAL,
  DataType.TIMEREVENT,
  DataType.SIGNALCATCHEVENT,
  DataType.EGATE,
] as const;

export const DeletableNodes = [
  DataType.PROCESS,
  DataType.APPROVAL,
  DataType.TIMEREVENT,
  DataType.SIGNALCATCHEVENT,
  DataType.EGATE,
  DataType.ENDEVENT,
] as const;

export type NewComponentTypes = typeof NewComponents[number];
export type DescribableNodeTypes = typeof DescribableNodes[number];
export type SelectableNodeTypes = typeof SelectableNodes[number];
export type EditableNodeTypes = typeof EditableNodes[number];
export type DeletableNodeTypes = typeof DeletableNodes[number];

export interface LoggerInterface {
  log: (...args: unknown[]) => void;
}

export type OpenFileInterface = (
  opts: OpenDialogProps,
  cb?: (data: BufferDataset) => void
) => Promise<BufferDataset>;
