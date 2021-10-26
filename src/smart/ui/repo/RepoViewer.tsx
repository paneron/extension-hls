/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import { Button, ControlGroup, IToaster, Toaster } from '@blueprintjs/core';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import Workspace from '@riboseinc/paneron-extension-kit/widgets/Workspace';
import { useContext, useMemo, useState } from 'react';
import { react_flow_container_layout } from '../../../css/layout';
import { ModelWrapper } from '../../model/modelwrapper';
import {
  MMELRepo,
  RepoIndex,
  repoIndexPath,
  RepoItem,
  RepoItemType,
} from '../../model/repo';
import {
  getPathByNS,
  MMELToSerializable,
  RepoFileType,
} from '../../utils/repo/io';
import RepoModelFile from './RepoItem';
import RepoInfoPane from './RepoInfoPane';
import { EditorModel } from '../../model/editormodel';
import { createNewSMARTWorkspace } from '../../model/workspace';
import { getNamespace } from '../../utils/ModelFunctions';
import {
  createEmptyIndex,
  groupItems,
  setValueToIndex,
} from '../../utils/repo/CommonFunctions';
import { Popover2 } from '@blueprintjs/popover2';
import RepoImportMenu from './RepoImportMenu';
import { MMELDocument } from '../../model/document';

const RepoViewer: React.FC<{
  isVisible: boolean;
  className?: string;
  repo?: MMELRepo;
  setRepo: (x: MMELRepo | undefined) => void;
  isBSI: boolean;
}> = function ({ isVisible, className, repo, setRepo, isBSI }) {
  const { useObjectData, updateObjects } = useContext(DatasetContext);

  const [toaster] = useState<IToaster>(Toaster.create());
  const repoFile = useObjectData({ objectPaths: [repoIndexPath] });

  const repoData = repoFile.value.data[repoIndexPath];
  const index: RepoIndex = (repoData ?? createEmptyIndex()) as RepoIndex;

  const [refs, imps, docs] = useMemo(() => groupItems(index), [index]);

  async function saveIndex(
    updated: RepoIndex,
    ns?: string,
    model?: EditorModel
  ) {
    if (updateObjects) {
      if (ns !== undefined && model !== undefined) {
        const task = updateObjects({
          commitMessage: 'Updating concept',
          _dangerouslySkipValidation: true,
          objectChangeset: {
            [repoIndexPath]: { oldValue: undefined, newValue: updated },
            [getPathByNS(ns, RepoFileType.MODEL)]: {
              newValue: MMELToSerializable(model),
            },
            [getPathByNS(ns, RepoFileType.MAP)]: {
              newValue: { id: getNamespace(model), mapSet: {}, docs: {} },
            },
            [getPathByNS(ns, RepoFileType.WORKSPACE)]: {
              newValue: createNewSMARTWorkspace(),
            },
          },
        });
        task.then(() => {
          toaster.show({
            message: `Done: model with namespace ${ns} added to the repository`,
            intent: 'success',
          });
        });
      } else {
        await updateObjects({
          commitMessage: 'Updating concept',
          _dangerouslySkipValidation: true,
          objectChangeset: {
            [repoIndexPath]: { oldValue: undefined, newValue: updated },
          },
        });
      }
    } else {
      toaster.show({
        message: 'No write access to the repository',
        intent: 'danger',
      });
    }
  }

  async function saveIndexWithDoc(updated: RepoIndex, doc: MMELDocument) {
    if (updateObjects) {
      const task = updateObjects({
        commitMessage: 'Updating concept',
        _dangerouslySkipValidation: true,
        objectChangeset: {
          [repoIndexPath]: { oldValue: undefined, newValue: updated },
          [getPathByNS(doc.id, RepoFileType.MODEL)]: {
            newValue: doc,
          },
        },
      });
      task.then(() => {
        toaster.show({
          message: `Done: document with id ${doc.id} added to the repository`,
          intent: 'success',
        });
      });
    } else {
      toaster.show({
        message: 'No write access to the repository',
        intent: 'danger',
      });
    }
  }

  function addItem(x: RepoItem) {
    if (x.namespace === '') {
      toaster.show({
        message: 'Invalid item: namespace is empty',
        intent: 'danger',
      });
    } else if (index[x.namespace] !== undefined) {
      toaster.show({
        message: 'Error: item with the same namespace already exists',
        intent: 'danger',
      });
    } else {
      const updated = setValueToIndex(index, x.namespace, x);
      return updated;
    }
    return undefined;
  }

  function addDoc(x: MMELDocument) {
    const item: RepoItem = {
      namespace: x.id,
      shortname: x.id,
      title: x.title,
      date: new Date(),
      type: 'Doc',
    };
    const updated = addItem(item);
    if (updated !== undefined) {
      saveIndexWithDoc(updated, x);
    }
  }

  function addMW(m: ModelWrapper, type: RepoItemType) {
    const model = m.model;
    const meta = model.meta;
    const newItem: RepoItem = {
      namespace: meta.namespace,
      shortname: meta.shortname,
      title: meta.title,
      date: new Date(),
      type,
    };
    const updated = addItem(newItem);
    if (updated !== undefined) {
      saveIndex(updated, newItem.namespace, model);
    }
  }

  function deleteItem(ns: string) {
    const updated = { ...index };
    delete updated[ns];
    saveIndex(updated);
    if (ns === repo?.ns) {
      setRepo(undefined);
    }
  }

  const toolbar = (
    <ControlGroup>
      <Popover2
        minimal
        placement="bottom-start"
        content={
          <RepoImportMenu
            addImpMW={m => addMW(m, 'Imp')}
            addRefMW={m => addMW(m, 'Ref')}
            addDoc={addDoc}
            isBSIEnabled={isBSI}
          />
        }
      >
        <Button>Import</Button>
      </Popover2>
    </ControlGroup>
  );

  return isVisible ? (
    <Workspace toolbar={toolbar} className={className}>
      <RepoInfoPane
        repo={repo}
        index={index}
        onClose={() => setRepo(undefined)}
      />
      <RepoGroup
        legend="Reference models"
        list={refs}
        deleteItem={deleteItem}
        setRepo={setRepo}
      />
      <RepoGroup
        legend="Implementation models"
        list={imps}
        deleteItem={deleteItem}
        setRepo={setRepo}
      />
      <RepoGroup
        legend="SMART documents"
        list={docs}
        deleteItem={deleteItem}
        setRepo={setRepo}
      />
    </Workspace>
  ) : (
    <div></div>
  );
};

const EmptyMsg = () => <p style={{ margin: 10 }}>No item in the repository.</p>;

const RepoGroup: React.FC<{
  legend: string;
  list: RepoItem[];
  deleteItem: (ns: string) => void;
  setRepo: (x: MMELRepo | undefined) => void;
}> = function ({ legend, list, deleteItem, setRepo }) {
  return (
    <fieldset>
      <legend>{legend}</legend>
      <div css={react_flow_container_layout}>
        {Object.values(list).length === 0 && <EmptyMsg />}
        <div
          style={{
            display: 'flex',
            gap: 10,
            margin: 10,
          }}
        >
          {list.map(x => (
            <RepoModelFile
              key={x.namespace}
              file={x}
              onDelete={() => deleteItem(x.namespace)}
              onOpen={() => setRepo({ ns: x.namespace, type: x.type })}
            />
          ))}
        </div>
      </div>
    </fieldset>
  );
};

export default RepoViewer;
