import { RefObject } from 'react';
import {
  DataType,
  MMELNode,
  MMELObject,
} from '../serialize/interface/baseinterface';
import {
  MMELDataAttribute,
  MMELDataClass,
  MMELEnum,
  MMELRegistry,
} from '../serialize/interface/datainterface';
import {
  MMELEndEvent,
  MMELSignalCatchEvent,
  MMELStartEvent,
  MMELTimerEvent,
} from '../serialize/interface/eventinterface';
import {
  MMELEGate,
  MMELSubprocess,
} from '../serialize/interface/flowcontrolinterface';
import {
  MMELApproval,
  MMELProcess,
} from '../serialize/interface/processinterface';
import {
  MMELMetadata,
  MMELProvision,
  MMELReference,
  MMELRole,
  MMELVariable,
  MMELView,
} from '../serialize/interface/supportinterface';
import {
  isApproval,
  isDataClass,
  isEGate,
  isEndEvent,
  isProcess,
  isRegistry,
  isSignalEvent,
  isStartEvent,
  isTimerEvent,
} from '../serialize/util/validation';

export enum ModelType {
  EDIT = 'edit',
  REF = 'ref',
  IMP = 'imp',
}

export interface EditorBaseObjectType {
  objectVersion: 'Editor';
}

export type EditorNode = MMELNode & EditorNodeChild;
export type EditorStartEvent = MMELStartEvent & EditorNode;
export type EditorSubprocess = MMELSubprocess & EditorPage;
export type EditorDataClass = MMELDataClass &
  EditorNode &
  EditorDataClassReference;
export type EditorRegistry = MMELRegistry & EditorNode;
export type EditorEndEvent = MMELEndEvent & EditorNode;
export type EditorSignalEvent = MMELSignalCatchEvent & EditorNode;
export type EditorTimerEvent = MMELTimerEvent & EditorNode;
export type EditorEGate = MMELEGate & EditorNode;
export type EditorApproval = MMELApproval & EditorNode;
export type EditorProcess = MMELProcess & EditorNode;

export interface EditorNodeChild extends EditorBaseObjectType {
  added: boolean;
  pages: Set<string>;
  uiref?: RefObject<HTMLDivElement>;
}

export interface EditorDataClassReference extends EditorBaseObjectType {
  rdcs: Set<string>;
  mother: string;
}

export interface EditorPage extends EditorBaseObjectType {
  start: string;
  neighbor: Record<string, Set<string>>;
}

export interface EditorModel {
  meta: MMELMetadata;
  roles: Record<string, MMELRole>;
  provisions: Record<string, MMELProvision>;
  elements: Record<string, EditorNode>;
  refs: Record<string, MMELReference>;
  enums: Record<string, MMELEnum>;
  vars: Record<string, MMELVariable>;
  pages: Record<string, EditorSubprocess>;
  views: Record<string, MMELView>;
  root: string;
}

export function isEditorNode(x: unknown): x is EditorNode {
  const test = x as EditorNode;
  return (
    test !== null &&
    test.objectVersion !== undefined &&
    test.objectVersion === 'Editor'
  );
}

export function isEditorProcess(x: EditorNode): x is EditorProcess {
  return isProcess(x);
}

export function isEditorRegistry(x: EditorNode): x is EditorRegistry {
  return isRegistry(x);
}

export function isEditorApproval(x: EditorNode): x is EditorApproval {
  return isApproval(x);
}

export function isEditorDataClass(x: EditorNode): x is EditorDataClass {
  return isDataClass(x);
}

export function isEditorData(
  x: EditorNode
): x is EditorRegistry | EditorDataClass {
  return isEditorRegistry(x) || isEditorDataClass(x);
}

export function isEditorTimerEvent(x: EditorNode): x is EditorTimerEvent {
  return isTimerEvent(x);
}

export function isEditorEndEvent(x: EditorNode): x is EditorEndEvent {
  return isEndEvent(x);
}

export function isEditorStartEvent(x: EditorNode): x is EditorStartEvent {
  return isStartEvent(x);
}

export function isEditorSignalEvent(x: EditorNode): x is EditorSignalEvent {
  return isSignalEvent(x);
}

export function isEditorEgate(x: EditorNode): x is EditorEGate {
  return isEGate(x);
}

export function isMMELDataAttribute(x: MMELObject): x is MMELDataAttribute {
  return x.datatype === DataType.DATAATTRIBUTE;
}

export function getEditorNodeInfoById(model: EditorModel, id: string): string {
  if (id !== '') {
    const node = model.elements[id];
    if (
      node !== undefined &&
      (isEditorProcess(node) || isEditorApproval(node))
    ) {
      return node.name;
    }
  }
  return 'Node not found';
}

export function getEditorRoleById(
  model: EditorModel,
  id: string
): MMELRole | null {
  if (id === '') {
    return null;
  }
  const r = model.roles[id];
  return r ?? null;
}

export function getEditorRefById(
  model: EditorModel,
  id: string
): MMELReference | null {
  if (id === '') {
    return null;
  }
  const r = model.refs[id];
  return r ?? null;
}

export function getEditorRegistryById(
  model: EditorModel,
  id: string
): EditorRegistry | null {
  if (id === '') {
    return null;
  }
  const r = model.elements[id];
  if (r !== undefined && isEditorRegistry(r)) {
    return r;
  }
  return null;
}

export function getEditorDataClassById(
  model: EditorModel,
  id: string
): EditorDataClass | null {
  if (id === '') {
    return null;
  }
  const r = model.elements[id];
  if (r !== undefined && isEditorDataClass(r)) {
    return r;
  }
  return null;
}

export function getEditorProvisionById(
  model: EditorModel,
  id: string
): MMELProvision | null {
  if (id === '') {
    return null;
  }
  const r = model.provisions[id];
  return r ?? null;
}
