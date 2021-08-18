import { MMELObject } from './baseinterface';

export enum VarType {
  EMPTY = '',
  DATA = 'DATAITEM',
  LISTDATA = 'DATALIST',
  DERIVED = 'DERIVED',
}

export interface MMELMetadata extends MMELObject {
  schema: string;
  author: string;
  title: string;
  edition: string;
  namespace: string;
}

export interface MMELReference extends MMELObject {
  id: string;
  document: string;
  clause: string;
}

export interface MMELProvision extends MMELObject {
  subject: Record<string, string>;
  id: string;
  modality: string;
  condition: string;
  ref: Set<string>;
}

export interface MMELRole extends MMELObject {
  id: string;
  name: string;
}

export interface MMELVariable extends MMELObject {
  id: string;
  type: VarType;
  definition: string;
  description: string;
}