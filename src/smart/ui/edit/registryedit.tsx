import { FormGroup } from '@blueprintjs/core';
import React from 'react';
import {
  EditorDataClass,
  EditorModel,
  EditorRegistry,
  isEditorApproval,
  isEditorDataClass,
  isEditorProcess,
  isEditorRegistry,
} from '../../model/editormodel';
import {
  checkId,
  defaultItemSorter,
  fillRDCS,
  genDCIdByRegId,
  getReferenceDCTypeName,
  replaceSet,
} from '../../utils/ModelFunctions';
import { createDataClass, createRegistry } from '../../utils/EditorFactory';
import { IListItem, IManageHandler, NormalTextField } from '../common/fields';
import ListManagePage from '../common/listmanagement/listmanagement';
import AttributeEditPage from './attributeedit';
import { DataType } from '../../serialize/interface/baseinterface';

type RegistryCombined = EditorDataClass & {
  title: string;
};

const initObj: RegistryCombined = { ...createDataClass(''), title: '' };

const RegistryEditPage: React.FC<{
  model: EditorModel;
  setModel: (model: EditorModel) => void;
}> = function ({ model, setModel }) {
  function matchFilter(reg: EditorRegistry, filter: string) {
    return (
      filter === '' ||
      reg.id.toLowerCase().includes(filter) ||
      reg.title.toLowerCase().includes(filter)
    );
  }

  function getRegListItems(filter: string): IListItem[] {
    return Object.values(model.elements)
      .filter(x => isEditorRegistry(x) && matchFilter(x, filter))
      .map(x => ({ id: x.id, text: (x as EditorRegistry).title }))
      .sort(defaultItemSorter);
  }

  function replaceReferences(
    matchregid: string,
    matchdcid: string,
    replaceid: string,
    newdcid: string
  ) {
    const oldrefdcid = getReferenceDCTypeName(matchdcid);
    const newrefdcid = getReferenceDCTypeName(newdcid);
    for (const x in model.elements) {
      const elm = model.elements[x];
      if (isEditorProcess(elm)) {
        replaceSet(elm.input, matchregid, replaceid);
        replaceSet(elm.output, matchregid, replaceid);
      } else if (isEditorApproval(elm)) {
        replaceSet(elm.records, matchregid, replaceid);
      } else if (isEditorDataClass(elm)) {
        for (const dc of elm.rdcs) {
          if (dc === matchdcid) {
            elm.rdcs.delete(dc);
            if (newdcid !== '') {
              elm.rdcs.add(newdcid);
            }
          }
        }
        for (const a in elm.attributes) {
          const att = elm.attributes[a];
          if (att.type === matchdcid) {
            att.type = newdcid;
          } else if (att.type === oldrefdcid) {
            att.type = newrefdcid;
          }
        }
      }
    }
    for (const p in model.pages) {
      const page = model.pages[p];
      const data = page.data[matchregid];
      if (data !== undefined) {
        delete page.data[matchregid];
        if (replaceid !== '') {
          data.element = replaceid;
          page.data[replaceid] = data;
        }
      }
    }
  }

  function removeRegListItem(ids: string[]) {
    for (const id of ids) {
      const reg = model.elements[id];
      if (isEditorRegistry(reg)) {
        delete model.elements[id];
        delete model.elements[reg.data];
        replaceReferences(id, reg.data, '', '');
      }
    }
    setModel(model);
  }

  function addRegistry(reg: RegistryCombined): boolean {
    const dcid = genDCIdByRegId(reg.id);
    if (
      checkId(reg.id, model.elements) &&
      checkId(dcid, model.elements, true)
    ) {
      const newreg = createRegistry(reg.id);
      const newdc = getDCFromCombined(dcid, reg);
      newreg.data = dcid;
      newreg.title = reg.title;
      model.elements[reg.id] = newreg;
      model.elements[dcid] = newdc;
      fillRDCS(newdc, model.elements);
      setModel(model);
      return true;
    }
    return false;
  }

  function updateRegistry(oldid: string, reg: RegistryCombined): boolean {
    const dcid = genDCIdByRegId(reg.id);
    const old = model.elements[oldid];
    if (isEditorRegistry(old)) {
      if (oldid !== reg.id) {
        if (
          checkId(reg.id, model.elements) &&
          checkId(dcid, model.elements, true)
        ) {
          delete model.elements[oldid];
          delete model.elements[old.data];
          const newreg = createRegistry(reg.id);
          const newdc = getDCFromCombined(dcid, reg);
          newreg.data = dcid;
          newreg.title = reg.title;
          model.elements[reg.id] = newreg;
          model.elements[dcid] = newdc;
          fillRDCS(newdc, model.elements);
          replaceReferences(oldid, old.data, reg.id, dcid);
          setModel(model);
          return true;
        }
        return false;
      } else {
        old.title = reg.title;
        model.elements[oldid] = old;
        const dc = getDCFromCombined(dcid, reg);
        model.elements[old.data] = dc;
        fillRDCS(dc, model.elements);
        setModel(model);
        return true;
      }
    }
    return false;
  }

  function getRegById(id: string): RegistryCombined {
    const reg = model.elements[id];
    if (!isEditorRegistry(reg)) {
      return { ...initObj };
    }
    const dc = model.elements[reg.data];
    if (!isEditorDataClass(dc)) {
      return { ...initObj };
    }
    return { ...dc, id: id, title: reg.title };
  }

  const reghandler: IManageHandler<RegistryCombined> = {
    filterName: 'Registry filter',
    itemName: 'Data Registries',
    Content: RegistryEditItemPage,
    initObj: { ...initObj },
    model: model,
    getItems: getRegListItems,
    removeItems: removeRegListItem,
    addItem: obj => addRegistry(obj),
    updateItem: (oldid, obj) => updateRegistry(oldid, obj),
    getObjById: getRegById,
  };

  return <ListManagePage {...reghandler} />;
};

const RegistryEditItemPage: React.FC<{
  object: RegistryCombined;
  model?: EditorModel;
  setObject: (obj: RegistryCombined) => void;
}> = ({ object: reg, model, setObject: setReg }) => {
  return (
    <FormGroup>
      <NormalTextField
        text="Registry ID"
        value={reg.id}
        onChange={x => setReg({ ...reg, id: x.replaceAll(/\s+/g, '') })}
      />
      <NormalTextField
        text="Registry title"
        value={reg.title}
        onChange={x => setReg({ ...reg, title: x })}
      />
      <AttributeEditPage
        attributes={{ ...reg.attributes }}
        model={model!}
        setAtts={x => setReg({ ...reg, attributes: x })}
      />
    </FormGroup>
  );
};

function getDCFromCombined(
  dcid: string,
  reg: RegistryCombined
): EditorDataClass {
  return {
    attributes: reg.attributes,
    id: dcid,
    datatype: DataType.DATACLASS,
    added: reg.added,
    pages: reg.pages,
    objectVersion: reg.objectVersion,
    rdcs: reg.rdcs,
    mother: reg.id,
  };
}

export default RegistryEditPage;
