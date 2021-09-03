/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { IToastProps, Tab, Tabs } from '@blueprintjs/core';
import { jsx } from '@emotion/react';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import React, { useContext, useState } from 'react';
import { mgd_label } from '../../../css/form';
import {
  mgd_tabs,
  mgd_tabs__item,
  mgd_tabs__item__selected,
  mgd_tabs__item__unselected,
} from '../../../css/MGDTabs';
import MGDDisplayPane from '../../MGDComponents/MGDDisplayPane';
import { EditorModel } from '../../model/editormodel';
import { MMELMetadata } from '../../serialize/interface/supportinterface';
import DataClassEditPage from '../edit/dataclassedit';
import EnumEditPage from '../edit/enumedit';
import MeasurementEditPage from '../edit/measurementedit';
import MetaEditPage from '../edit/metaedit';
import ReferenceEditPage from '../edit/refedit';
import RegistryEditPage from '../edit/registryedit';
import RoleEditPage from '../edit/roleedit';

export enum SETTINGPAGE {
  METAPAGE = 'meta',
  ROLEPAGE = 'role',
  REFPAGE = 'ref',
  REGISTRYPAGE = 'reg',
  DATAPAGE = 'dc',
  ENUMPAGE = 'enum',
  MEASUREMENT = 'measure',
}

interface TabProps {
  title: string;
  Panel: React.FC<{
    model: EditorModel;
    setModel: (m: EditorModel) => void;
    onMetaChanged: (meta: MMELMetadata) => void;
    showMsg: (msg: IToastProps) => void;
  }>;
}

const tabs: Record<SETTINGPAGE, TabProps> = {
  [SETTINGPAGE.METAPAGE]: {
    title: 'Metadata',
    Panel: ({ model, onMetaChanged, showMsg }) => (
      <MetaEditPage
        meta={model.meta}
        setMetadata={(meta: MMELMetadata) => {
          onMetaChanged(meta);
        }}
        showMsg={showMsg}
      />
    ),
  },
  [SETTINGPAGE.ROLEPAGE]: {
    title: 'Roles',
    Panel: ({ model, setModel }) => (
      <RoleEditPage model={model} setModel={setModel} />
    ),
  },
  [SETTINGPAGE.REFPAGE]: {
    title: 'References',
    Panel: ({ model, setModel }) => (
      <ReferenceEditPage model={model} setModel={setModel} />
    ),
  },
  [SETTINGPAGE.REGISTRYPAGE]: {
    title: 'Data Registry',
    Panel: ({ model, setModel }) => (
      <RegistryEditPage model={model} setModel={setModel} />
    ),
  },
  [SETTINGPAGE.DATAPAGE]: {
    title: 'Data structure',
    Panel: ({ model, setModel }) => (
      <DataClassEditPage model={model} setModel={setModel} />
    ),
  },
  [SETTINGPAGE.ENUMPAGE]: {
    title: 'Enumeration',
    Panel: ({ model, setModel }) => (
      <EnumEditPage model={model} setModel={setModel} />
    ),
  },
  [SETTINGPAGE.MEASUREMENT]: {
    title: 'Measurement',
    Panel: ({ model, setModel }) => (
      <MeasurementEditPage model={model} setModel={setModel} />
    ),
  },
};

const BasicSettingPane: React.FC<{
  model: EditorModel;
  setModel: (m: EditorModel) => void;
  onMetaChanged: (meta: MMELMetadata) => void;
  showMsg: (msg: IToastProps) => void;
}> = ({ model, setModel, onMetaChanged, showMsg }) => {
  const { logger } = useContext(DatasetContext);
  const [page, setPage] = useState<SETTINGPAGE>(SETTINGPAGE.METAPAGE);

  logger?.log('Enter setting page: ', page);
  return (
    <MGDDisplayPane>
      <Tabs
        css={mgd_tabs}
        id="TabsExample"
        onChange={x => setPage(x as SETTINGPAGE)}
        selectedTabId={page}
        animate={false}
      >
        {Object.entries(tabs).map(([key, props]) => (
          <Tab
            id={key}
            title={
              <span
                css={[
                  mgd_tabs__item,
                  key === page
                    ? mgd_tabs__item__selected
                    : mgd_tabs__item__unselected,
                ]}
              >
                <label css={mgd_label}> {props.title} </label>
              </span>
            }
            panel={
              <props.Panel
                model={model}
                setModel={setModel}
                onMetaChanged={onMetaChanged}
                showMsg={showMsg}
              />
            }
          />
        ))}
      </Tabs>
    </MGDDisplayPane>
  );
};

export default BasicSettingPane;
