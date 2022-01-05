import { FormGroup } from '@blueprintjs/core';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import MGDDisplayPane from '../../MGDComponents/MGDDisplayPane';
import {
  EditorModel,
  EditorProcess,
  EditorRegistry,
} from '../../model/editormodel';
import { DataType } from '../../serialize/interface/baseinterface';
import {
  MMELLink,
  MMELNote,
  MMELProvision,
  MMELReference,
  MMELRole,
} from '../../serialize/interface/supportinterface';
import {
  checkId,
  getModelAllRegs,
  getModelAllRoles,
  removeSpace,
  updatePageElement,
} from '../../utils/ModelFunctions';
import { createNote, createProvision } from '../../utils/EditorFactory';
import { createNewPage } from '../../utils/ModelAddComponentHandler';
import { deletePage } from '../../utils/ModelRemoveComponentHandler';
import {
  MultiReferenceSelector,
  NormalComboBox,
  NormalTextField,
  ReferenceSelector,
} from '../common/fields';
import ListWithPopoverItem from '../common/listmanagement/listPopoverItem';
import { EditPageButtons } from './commons';
import {
  IMeasure,
  matchMeasurementFilter,
  MeasurementItem,
} from './measurementExpressionEdit';
import { matchProvisionFilter, ProvisonItem } from './provisionedit';
import RoleSelector from './components/RoleSelector';
import { DescriptionItem } from '../common/description/fields';
import RegistrySelector from './components/RegistrySelector';
import ProvisionListQuickEdit from './components/ProvisionList';
import MeasureListQuickEdit from './components/MeasurementListEdit';
import { RefTextSelection } from '../../model/selectionImport';
import { matchNoteFilter, NoteItem } from './NoteEdit';
import NoteListQuickEdit from './components/NoteList';
import { LinkItem, matchLinkFilter } from './LinkEdit';

const NEEDSUBPROCESS = 'need sub';

const SUBPROCESSYES = 'Yes';
const SUBPROCESSNO = 'No';

const SUBPROCESSOPTIONS = [SUBPROCESSYES, SUBPROCESSNO];

function getInitProvisions(
  model: EditorModel,
  process: EditorProcess
): Record<string, MMELProvision> {
  const initProvision: Record<string, MMELProvision> = {};
  Object.keys(model.provisions)
    .filter(k => process.provision.has(k))
    .forEach(k => {
      initProvision[k] = model.provisions[k];
    });
  return initProvision;
}

function getInitNotes(
  model: EditorModel,
  process: EditorProcess
): Record<string, MMELNote> {
  const initNotes: Record<string, MMELNote> = {};
  Object.keys(model.notes)
    .filter(k => process.notes.has(k))
    .forEach(k => {
      initNotes[k] = model.notes[k];
    });
  return initNotes;
}

function getInitLinks(
  model: EditorModel,
  process: EditorProcess
): Record<string, MMELLink> {
  const initLinks: Record<string, MMELLink> = {};
  Object.keys(model.links)
    .filter(k => process.links.has(k))
    .forEach(k => {
      initLinks[k] = model.links[k];
    });
  return initLinks;
}

function getInitMeasurement(process: EditorProcess): Record<string, IMeasure> {
  const initMeasurement: Record<string, IMeasure> = {};
  process.measure.forEach((v, k) => {
    const id = '' + k;
    initMeasurement[id] = {
      id: id,
      datatype: DataType.VARIABLE,
      measure: v,
    };
  });
  return initMeasurement;
}

const emptyMeasurement: IMeasure = {
  id: '',
  datatype: DataType.VARIABLE,
  measure: '',
};

const emptyLink: MMELLink = {
  id: '',
  title: '',
  description: '',
  link: '',
  type: 'REPO',
  datatype: DataType.LINK,
};

interface CommonProcessEditProps {
  onUpdateClick: () => void;
  editing: EditorProcess;
  setEditing: (x: EditorProcess) => void;
  provisions: Record<string, MMELProvision>;
  setProvisions: (x: Record<string, MMELProvision>) => void;
  measurements: Record<string, IMeasure>;
  setMeasurements: (x: Record<string, IMeasure>) => void;
  model: EditorModel;
  onFullEditClick?: () => void;
  onDeleteClick?: () => void;
  onSubprocessClick?: () => void;
  notes: Record<string, MMELNote>;
  setNotes: (x: Record<string, MMELNote>) => void;
}

const EditProcessPage: React.FC<{
  model: EditorModel;
  setModel: (m: EditorModel) => void;
  id: string;
  closeDialog?: () => void;
  minimal?: boolean;
  onFullEditClick?: () => void;
  onDeleteClick?: () => void;
  onSubprocessClick?: () => void;
  provision?: RefTextSelection;
  setSelectedNode?: (id: string) => void;
}> = function ({
  model,
  setModel,
  id,
  closeDialog,
  minimal = false,
  onFullEditClick,
  onDeleteClick,
  onSubprocessClick,
  provision,
  setSelectedNode,
}) {
  const process = model.elements[id] as EditorProcess;

  const [editing, setEditing] = useState<EditorProcess>({ ...process });
  const [provisions, setProvisions] = useState<Record<string, MMELProvision>>(
    getInitProvisions(model, process)
  );
  const [notes, setNotes] = useState<Record<string, MMELNote>>(
    getInitNotes(model, process)
  );
  const [measurements, setMeasurements] = useState<Record<string, IMeasure>>(
    getInitMeasurement(process)
  );
  const [links, setLinks] = useState<Record<string, MMELLink>>(
    getInitLinks(model, process)
  );
  const [hasChange, setHasChange] = useState<boolean>(false);

  const roleObjects = useMemo(() => getModelAllRoles(model), [model]);
  const roles = useMemo(
    () => ['', ...roleObjects.map(r => r.id)],
    [roleObjects]
  );
  const registryObjects = useMemo(() => getModelAllRegs(model), [model]);
  const regs = useMemo(() => registryObjects.map(r => r.id), [registryObjects]);
  const tables = useMemo(
    () => Object.values(model.tables).map(t => t.id),
    [model.tables]
  );
  const figures = useMemo(
    () => Object.values(model.figures).map(t => t.id),
    [model.figures]
  );
  const modelRef = useRef<EditorModel>();
  modelRef.current = model;

  function setPStart(x: string) {
    if (x === SUBPROCESSYES) {
      setEditing({ ...editing, page: NEEDSUBPROCESS });
    } else {
      setEditing({ ...editing, page: '' });
    }
  }

  function onUpdateClick() {
    const updated = save(
      id,
      editing,
      provisions,
      measurements,
      notes,
      links,
      model
    );
    if (updated !== null) {
      setModel({ ...updated });
      if (closeDialog !== undefined) {
        closeDialog();
      }
    }
    setHasChange(false);
  }

  function onAddReference(refs: Record<string, MMELReference>) {
    setModel({ ...model, refs });
  }

  function setEdit(x: EditorProcess) {
    setEditing(x);
    onChange();
  }

  function setPros(x: Record<string, MMELProvision>) {
    setProvisions(x);
    onChange();
  }

  function setMeasure(x: Record<string, IMeasure>) {
    setMeasurements(x);
    onChange();
  }

  function setN(x: Record<string, MMELNote>) {
    setNotes(x);
    onChange();
  }

  function onChange() {
    if (!hasChange) {
      setHasChange(true);
    }
  }

  function saveOnExit() {
    setHasChange(hc => {
      if (hc) {
        setEditing(edit => {
          setMeasurements(mea => {
            setProvisions(pros => {
              setNotes(nos => {
                const updated = save(
                  id,
                  edit,
                  pros,
                  mea,
                  nos,
                  links,
                  modelRef.current!
                );
                if (updated !== null) {
                  setModel(updated);
                  if (closeDialog !== undefined) {
                    closeDialog();
                  }
                }
                return nos;
              });
              return pros;
            });
            return mea;
          });
          return edit;
        });
      }
      return false;
    });
  }

  function onNewID(id: string) {
    const oldid = process.id;
    const updated = save(
      oldid,
      { ...editing, id },
      provisions,
      measurements,
      notes,
      links,
      model
    );
    if (updated !== null) {
      setModel({ ...updated });
    }
    setHasChange(false);
    if (setSelectedNode !== undefined) {
      setSelectedNode(id);
    }
  }

  const fullEditClick =
    onFullEditClick !== undefined
      ? function () {
          if (hasChange) {
            onUpdateClick();
          }
          onFullEditClick();
        }
      : undefined;

  const commonProps = {
    onUpdateClick,
    editing,
    setEditing: setEdit,
    provisions,
    setProvisions: setPros,
    measurements,
    setMeasurements: setMeasure,
    notes,
    setNotes: setN,
    model,
    onFullEditClick: fullEditClick,
    onDeleteClick,
    onSubprocessClick,
  };

  const fullEditProps = {
    closeDialog,
    setPStart,
    roles,
    regs,
    tables,
    figures,
    links,
    setLinks,
  };

  const quickEditProps = {
    roleObjects,
    registryObjects,
    process,
    saveOnExit,
    provision,
    onAddReference,
    initID: process.id,
    validTest: (id: string) => id === process.id || checkId(id, model.elements),
    onNewID,
  };

  useEffect(() => {
    setEditing(process);
    setProvisions(getInitProvisions(model, process));
    setNotes(getInitNotes(model, process));
    setMeasurements(getInitMeasurement(process));
  }, [process]);

  return minimal ? (
    <QuickVersionEdit {...commonProps} {...quickEditProps} />
  ) : (
    <FullVersionEdit {...commonProps} {...fullEditProps} />
  );
};

const QuickVersionEdit: React.FC<
  CommonProcessEditProps & {
    roleObjects: MMELRole[];
    registryObjects: EditorRegistry[];
    process: EditorProcess;
    saveOnExit: () => void;
    provision?: RefTextSelection;
    onAddReference: (refs: Record<string, MMELReference>) => void;
  }
> = function (props) {
  const {
    editing,
    setEditing,
    measurements,
    setMeasurements,
    provisions,
    setProvisions,
    model,
    roleObjects,
    registryObjects,
    process,
    saveOnExit,
    provision,
    onAddReference,
    notes,
    setNotes,
  } = props;

  useEffect(() => saveOnExit, [process]);

  return (
    <FormGroup>
      <EditPageButtons {...props} />
      <DescriptionItem label="Process ID" value={editing.id} />
      <NormalTextField
        text="Process Name"
        value={editing.name}
        onChange={x => setEditing({ ...editing, name: x })}
      />
      <RoleSelector
        label="Actor"
        activeItem={editing.actor !== '' ? model.roles[editing.actor] : null}
        items={roleObjects}
        onItemSelect={x =>
          setEditing({ ...editing, actor: x !== null ? x.id : '' })
        }
      />
      <RegistrySelector
        label="Input data registry"
        selected={editing.input}
        items={registryObjects}
        onItemSelect={x =>
          setEditing({ ...editing, input: new Set([...editing.input, x.id]) })
        }
        onTagRemove={x => {
          editing.input = new Set([...editing.input].filter(s => x !== s));
          setEditing({ ...editing });
        }}
      />
      <RegistrySelector
        label="Output data registry"
        selected={editing.output}
        items={registryObjects}
        onItemSelect={x =>
          setEditing({ ...editing, output: new Set([...editing.output, x.id]) })
        }
        onTagRemove={x => {
          editing.output = new Set([...editing.output].filter(s => x !== s));
          setEditing({ ...editing });
        }}
      />
      <ProvisionListQuickEdit
        provisions={provisions}
        setProvisions={setProvisions}
        selected={provision}
        model={model}
        onAddReference={onAddReference}
      />
      <NoteListQuickEdit
        notes={notes}
        setNotes={setNotes}
        selected={provision}
        model={model}
        onAddReference={onAddReference}
      />
      <MeasureListQuickEdit
        measurements={measurements}
        setMeasurements={setMeasurements}
      />
    </FormGroup>
  );
};

const FullVersionEdit: React.FC<
  CommonProcessEditProps & {
    closeDialog?: () => void;
    setPStart: (x: string) => void;
    roles: string[];
    regs: string[];
    tables: string[];
    figures: string[];
    links: Record<string, MMELLink>;
    setLinks: (x: Record<string, MMELLink>) => void;
  }
> = function (props) {
  const {
    editing,
    setEditing,
    measurements,
    setMeasurements,
    provisions,
    setProvisions,
    setPStart,
    model,
    roles,
    regs,
    tables,
    figures,
    notes,
    setNotes,
    links,
    setLinks,
  } = props;
  return (
    <MGDDisplayPane>
      <FormGroup>
        <EditPageButtons {...props} />
        <NormalTextField
          text="Process ID"
          value={editing.id}
          onChange={x => setEditing({ ...editing, id: removeSpace(x) })}
        />
        <NormalTextField
          text="Process Name"
          value={editing.name}
          onChange={x => setEditing({ ...editing, name: x })}
        />
        <NormalComboBox
          text="Subprocess"
          value={editing.page === '' ? SUBPROCESSNO : SUBPROCESSYES}
          options={SUBPROCESSOPTIONS}
          onChange={setPStart}
        />
        <ReferenceSelector
          text="Actor"
          filterName="Actor filter"
          value={editing.actor}
          options={roles}
          update={x => setEditing({ ...editing, actor: roles[x] })}
        />
        <MultiReferenceSelector
          text="Input data registry"
          options={regs}
          values={editing.input}
          filterName="Input Registry filter"
          add={x => {
            editing.input = new Set([...editing.input, ...x]);
            setEditing({ ...editing });
          }}
          remove={x => {
            editing.input = new Set([...editing.input].filter(s => !x.has(s)));
            setEditing({ ...editing });
          }}
        />
        <MultiReferenceSelector
          text="Output data registry"
          options={regs}
          values={editing.output}
          filterName="Output Registry filter"
          add={x => {
            editing.output = new Set([...editing.output, ...x]);
            setEditing({ ...editing });
          }}
          remove={x => {
            editing.output = new Set(
              [...editing.output].filter(s => !x.has(s))
            );
            setEditing({ ...editing });
          }}
        />
        <MultiReferenceSelector
          text="Reference tables"
          options={tables}
          values={editing.tables}
          filterName="Table filter"
          add={x => {
            editing.tables = new Set([...editing.tables, ...x]);
            setEditing({ ...editing });
          }}
          remove={x => {
            editing.tables = new Set(
              [...editing.tables].filter(s => !x.has(s))
            );
            setEditing({ ...editing });
          }}
        />
        <MultiReferenceSelector
          text="Reference multimedia"
          options={figures}
          values={editing.figures}
          filterName="Multimedia filter"
          add={x => {
            editing.figures = new Set([...editing.figures, ...x]);
            setEditing({ ...editing });
          }}
          remove={x => {
            editing.figures = new Set(
              [...editing.figures].filter(s => !x.has(s))
            );
            setEditing({ ...editing });
          }}
        />
        <ListWithPopoverItem
          items={{ ...provisions }}
          setItems={x => setProvisions(x as Record<string, MMELProvision>)}
          model={model}
          initObject={createProvision('')}
          matchFilter={matchProvisionFilter}
          getListItem={x => {
            const pro = x as MMELProvision;
            return {
              id: x.id,
              text: `${pro.modality}: ${pro.condition}`,
            };
          }}
          filterName="Provision filter"
          Content={ProvisonItem}
          label="Provisions"
          size={7}
          requireUniqueId={false}
        />
        <ListWithPopoverItem
          items={{ ...notes }}
          setItems={x => setNotes(x as Record<string, MMELNote>)}
          model={model}
          initObject={createNote('')}
          matchFilter={matchNoteFilter}
          getListItem={x => {
            const note = x as MMELNote;
            return {
              id: note.id,
              text: note.message,
            };
          }}
          filterName="Note filter"
          Content={NoteItem}
          label="Notes"
          size={7}
          requireUniqueId={false}
        />
        <ListWithPopoverItem
          items={{ ...measurements }}
          setItems={x => setMeasurements(x as Record<string, IMeasure>)}
          model={model}
          initObject={{ ...emptyMeasurement }}
          matchFilter={matchMeasurementFilter}
          getListItem={x => ({
            id: x.id,
            text: x.measure,
          })}
          filterName="Measurement filter"
          Content={MeasurementItem}
          label="Measurement tests"
          size={7}
          requireUniqueId={false}
        />
        <ListWithPopoverItem
          items={{ ...links }}
          setItems={x => setLinks(x as Record<string, MMELLink>)}
          model={model}
          initObject={{ ...emptyLink }}
          matchFilter={matchLinkFilter}
          getListItem={x => ({ id: x.id, text: x.title })}
          filterName="Link filter"
          Content={LinkItem}
          label="External links"
          size={7}
          requireUniqueId={false}
        />
      </FormGroup>
    </MGDDisplayPane>
  );
};

function save(
  oldId: string,
  process: EditorProcess,
  provisions: Record<string, MMELProvision>,
  measurements: Record<string, IMeasure>,
  notes: Record<string, MMELNote>,
  links: Record<string, MMELLink>,
  model: EditorModel
): EditorModel | null {
  process.measure = Object.values(measurements).map(m => m.measure);
  const oldProcess = model.elements[oldId] as EditorProcess;
  if (oldId !== process.id) {
    if (checkId(process.id, model.elements)) {
      delete model.elements[oldId];
      for (const p in model.pages) {
        const page = model.pages[p];
        updatePageElement(page, oldId, process.id);
      }
      model.elements[process.id] = process;
      checkPage(model, oldProcess.page, process);
    } else {
      return null;
    }
  } else {
    model.elements[oldId] = process;
    checkPage(model, oldProcess.page, process);
  }
  model.provisions = updateProvisions(
    model.provisions,
    oldProcess.provision,
    provisions
  );
  process.provision = new Set(Object.values(provisions).map(p => p.id));
  model.notes = updateNotes(model.notes, oldProcess.notes, notes);
  process.notes = new Set(Object.values(notes).map(n => n.id));
  model.links = updateLinks(model.links, oldProcess.links, links);
  process.links = new Set(Object.values(links).map(n => n.id));
  return model;
}

function updateProvisions(
  provisions: Record<string, MMELProvision>,
  old: Set<string>,
  update: Record<string, MMELProvision>
): Record<string, MMELProvision> {
  const newP = { ...provisions };
  for (const x of old) {
    delete newP[x];
  }
  let x = 1;
  for (const p in update) {
    const pro = update[p];
    while (newP['Provision' + x] !== undefined) {
      x++;
    }
    pro.id = 'Provision' + x;
    newP[pro.id] = pro;
    x++;
  }
  return newP;
}

function updateNotes(
  notes: Record<string, MMELNote>,
  old: Set<string>,
  update: Record<string, MMELNote>
): Record<string, MMELNote> {
  const newNotes = { ...notes };
  for (const x of old) {
    delete newNotes[x];
  }
  let x = 1;
  for (const p in update) {
    const pro = update[p];
    while (newNotes['Note' + x] !== undefined) {
      x++;
    }
    pro.id = 'Note' + x;
    newNotes[pro.id] = pro;
    x++;
  }
  return newNotes;
}

function updateLinks(
  links: Record<string, MMELLink>,
  old: Set<string>,
  update: Record<string, MMELLink>
): Record<string, MMELLink> {
  const newLinks = { ...links };
  for (const x of old) {
    delete newLinks[x];
  }
  let x = 1;
  for (const p in update) {
    const link = update[p];
    while (newLinks['Link' + x] !== undefined) {
      x++;
    }
    link.id = 'Link' + x;
    newLinks[link.id] = link;
    x++;
  }
  return newLinks;
}

function checkPage(
  model: EditorModel,
  oldPage: string,
  process: EditorProcess
) {
  const oldHasPage = oldPage !== '';
  const newHasPage = process.page !== '';
  if (!oldHasPage && newHasPage) {
    process.page = createNewPage(model);
  } else if (oldHasPage && !newHasPage) {
    deletePage(model, oldPage);
  }
}

export default EditProcessPage;
