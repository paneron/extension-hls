import React from 'react';
import BasicSettingPane from '../control/settings';
import { EditorModel } from '../../model/editormodel';
import { ModelWrapper } from '../../model/modelwrapper';
import { ConfirmDialog } from './confirmdialog';
import {
  DeletableNodeTypes,
  EditableNodeTypes,
  EditAction,
} from '../../utils/constants';
import { DeleteConfirmMessgae, deleteNodeAction } from '../../utils/ModelRemoveComponentHandler';
import { DataType } from '../../serialize/interface/baseinterface';
import EditProcessPage from '../edit/processedit';
import EditApprovalPage from '../edit/approvaledit';
import EditEGatePage from '../edit/egateedit';
import EditTimerPage from '../edit/timeredit';
import EditSignalEventPage from '../edit/signaleventedit';
import { EditorAction } from '../../model/editor/state';
import { EditorState } from '../../model/States';
import { ModelAction } from '../../model/editor/model';

export enum DiagTypes {
  SETTING = 'setting',
  DELETECONFIRM = 'confirm',
  EDITPROCESS = 'process',
  EDITAPPROVAL = 'approval',
  EDITTIMER = 'timer',
  EDITSIGNAL = 'signal',
  EDITEGATE = 'gate',
}

export enum MapperDiagTypes {
  EDITMAPPING = 'map',
  DOCUMENT = 'document',
}

export interface MapperDiagPackage {
  type: MapperDiagTypes | null;
  payload: EditMPropsInterface;
}

export interface DiagPackage {
  type: DiagTypes | null;
  callback: () => void;
  msg: string;
}

export interface IDiagInterface {
  state: EditorState;
  setModelWrapper: (mw: ModelWrapper) => void;
  act: (x: EditorAction) => void;
  callback: () => void;
  done: () => void;
  msg: string;
}

export interface EditorDiagProps {
  title: string;
  Panel: React.FC<IDiagInterface>;
  fullscreen: boolean;
}

export interface IDiagAction {
  nodeType: DeletableNodeTypes | EditableNodeTypes;
  model: EditorModel;
  page: string;
  id: string;  
  act: (x: ModelAction) => void;
}

export interface EditMPropsInterface {
  from: string;
  to: string;
}

function updateModel(
  model: EditorModel,
  setModelWrapper: (mw: ModelWrapper) => void,
  mw: ModelWrapper
) {
  setModelWrapper({ ...mw, model: { ...model } });
}

export const MyDiag: Record<DiagTypes, EditorDiagProps> = {
  [DiagTypes.SETTING]: {
    title: 'Setting',
    fullscreen: true,
    Panel: ({ state, act }) => (
      <BasicSettingPane model={state.model} act={act} />
    ),
  },
  [DiagTypes.DELETECONFIRM]: {
    title: 'Confirmation',
    fullscreen: false,
    Panel: ({ callback, done, msg }) => (
      <ConfirmDialog callback={callback} done={done} msg={msg} />
    ),
  },
  [DiagTypes.EDITPROCESS]: {
    title: 'Edit Process',
    fullscreen: true,
    Panel: ({ state, setModelWrapper, done: cancel, msg }) => (
      <EditProcessPage
        model={state.model}
        setModel={(m: EditorModel) =>
          updateModel(m, setModelWrapper, {
            model: state.model,
            page: state.page,
            type: 'model',
          })
        }
        id={msg}
        closeDialog={cancel}
      />
    ),
  },
  [DiagTypes.EDITAPPROVAL]: {
    title: 'Edit Approval',
    fullscreen: true,
    Panel: ({ state, setModelWrapper, done: cancel, msg }) => (
      <EditApprovalPage
        modelWrapper={{ model: state.model, page: state.page, type: 'model' }}
        setModel={(m: EditorModel) =>
          updateModel(m, setModelWrapper, {
            model: state.model,
            page: state.page,
            type: 'model',
          })
        }
        id={msg}
        closeDialog={cancel}
      />
    ),
  },
  [DiagTypes.EDITEGATE]: {
    title: 'Edit Gateway',
    fullscreen: true,
    Panel: ({ state, setModelWrapper, done: cancel, msg }) => (
      <EditEGatePage
        modelWrapper={{ model: state.model, page: state.page, type: 'model' }}
        setModel={(m: EditorModel) =>
          updateModel(m, setModelWrapper, {
            model: state.model,
            page: state.page,
            type: 'model',
          })
        }
        id={msg}
        closeDialog={cancel}
      />
    ),
  },
  [DiagTypes.EDITTIMER]: {
    title: 'Edit Timer',
    fullscreen: true,
    Panel: ({ state, setModelWrapper, done: cancel, msg }) => (
      <EditTimerPage
        modelWrapper={{ model: state.model, page: state.page, type: 'model' }}
        setModel={(m: EditorModel) =>
          updateModel(m, setModelWrapper, {
            model: state.model,
            page: state.page,
            type: 'model',
          })
        }
        id={msg}
        closeDialog={cancel}
      />
    ),
  },
  [DiagTypes.EDITSIGNAL]: {
    title: 'Edit Signal Catch Event',
    fullscreen: true,
    Panel: ({ state, setModelWrapper, done: cancel, msg }) => (
      <EditSignalEventPage
        modelWrapper={{ model: state.model, page: state.page, type: 'model' }}
        setModel={(m: EditorModel) =>
          updateModel(m, setModelWrapper, {
            model: state.model,
            page: state.page,
            type: 'model',
          })
        }
        id={msg}
        closeDialog={cancel}
      />
    ),
  },
};

export const SetDiagAction: Record<
  EditAction,
  (props: IDiagAction) => DiagPackage
> = {
  [EditAction.DELETE]: setDeleteAction,
  [EditAction.EDIT]: setEditAction,
};

const EditNodeType: Record<EditableNodeTypes, DiagTypes> = {
  [DataType.PROCESS]: DiagTypes.EDITPROCESS,
  [DataType.APPROVAL]: DiagTypes.EDITAPPROVAL,
  [DataType.TIMEREVENT]: DiagTypes.EDITTIMER,
  [DataType.SIGNALCATCHEVENT]: DiagTypes.EDITSIGNAL,
  [DataType.EGATE]: DiagTypes.EDITEGATE,
};

function setEditAction(props: IDiagAction): DiagPackage {
  return {
    type: EditNodeType[props.nodeType as EditableNodeTypes],
    callback: () => {},
    msg: props.id,
  };
}

function setDeleteAction(props: IDiagAction): DiagPackage {
  return {
    type: DiagTypes.DELETECONFIRM,
    callback: () => {
      const action = deleteNodeAction(
        props.model,
        props.page,
        props.id
      );
      props.act(action);      
    },
    msg: DeleteConfirmMessgae[props.nodeType],
  };
}
