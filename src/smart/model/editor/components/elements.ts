import { useReducer } from 'react';
import {
  refDCReplace,
  RoleAttribute,
  roleReplace,
} from '../../../utils/handler/cascadeModelHandler';
import { EditorNode } from '../../editormodel';
import { UndoReducerInterface } from '../interface';

type RoleCascadeAction = {
  subtask: 'process-role';
  role: string;
  ids: [string, RoleAttribute[]][]; // [process or approval ID, attribute name];
};

type RefCascadeAction = {
  subtask: 'process-ref';
  from: string | undefined; // remove from
  to: string | undefined; // add to
  ids: [string, string[]][];
};

type CascadeAction = (RoleCascadeAction | RefCascadeAction) & {
  task: 'cascade';
};

type EXPORT_ACTION = CascadeAction;

export type ElmAction = EXPORT_ACTION & { act: 'elements' };

type InitAction = {
  act: 'init';
  value: Record<string, EditorNode>;
};

type OwnAction = ElmAction | InitAction;

function cascadeReducer(
  elms: Record<string, EditorNode>,
  action: CascadeAction
): Record<string, EditorNode> {
  switch (action.subtask) {
    case 'process-role':
      return roleReplace(elms, action.ids, action.role);
    case 'process-ref':
      return refDCReplace(elms, action.ids, action.from, action.to);
  }
}

function elmReducer(
  elms: Record<string, EditorNode>,
  action: ElmAction
): Record<string, EditorNode> {
  switch (action.task) {
    case 'cascade':
      return cascadeReducer(elms, action);
  }
}

function reducer(
  elms: Record<string, EditorNode>,
  action: OwnAction
): Record<string, EditorNode> {
  switch (action.act) {
    case 'init':
      return { ...action.value };
    case 'elements':
      return elmReducer(elms, action);
  }
}

function findReverse(
  elms: Record<string, EditorNode>,
  action: ElmAction
): ElmAction | undefined {
  switch (action.task) {
    case 'cascade':
      return undefined;
  }
}

export function useElements(
  x: Record<string, EditorNode>
): UndoReducerInterface<Record<string, EditorNode>, ElmAction> {
  const [elms, dispatchElms] = useReducer(reducer, x);

  function act(action: ElmAction): ElmAction | undefined {
    dispatchElms(action);
    return findReverse(elms, action);
  }

  function init(x: Record<string, EditorNode>) {
    dispatchElms({ act: 'init', value: x });
  }

  return [elms, act, init];
}