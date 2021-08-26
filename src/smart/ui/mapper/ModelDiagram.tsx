/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { ControlGroup } from '@blueprintjs/core';
import { jsx } from '@emotion/react';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import Workspace from '@riboseinc/paneron-extension-kit/widgets/Workspace';
import React, { useContext } from 'react';
import ReactFlow, {
  OnLoadParams,
  ReactFlowProvider,
} from 'react-flow-renderer';
import {
  react_flow_container_layout,  
} from '../../../css/layout';
import { MGDButtonType } from '../../../css/MGDButton';
import MGDButton from '../../MGDComponents/MGDButton';
import { EditorModel, ModelType } from '../../model/editormodel';
import {
  addToHistory,
  createPageHistory,
  getBreadcrumbs,
  PageHistory,
  popPage,
} from '../../model/history';
import {
  getMapperReactFlowElementsFrom,
  ModelWrapper,
} from '../../model/modelwrapper';
import {
  EdgeTypes,
  MapperSelectedInterface,
  MapperState,
  MapperViewOption,
  NodeTypes,
} from '../../model/state';
import { handleModelOpen } from '../menu/file';
import ComponentSummary from '../popover/ComponentSummary';
import {
  indexModel,
  MapperModelLabel,
  MapperModelType,
  MapSet,
} from './mapmodel';
import {
  isParentMapFullCovered,
  MappingResultStyles,
  MappingSourceStyles,
  MapResultType,
} from './MappingCalculator';
import MappingLegendPane from './mappinglegend';

const ModelDiagram: React.FC<{
  className?: string;
  viewOption: MapperViewOption;
  mapSet: MapSet;
  onMapSetChanged: (mp: MapSet) => void;
  modelProps: MapperState;
  setProps: (mp: MapperState) => void;
  mapResult?: MapResultType;
  onModelChanged: (model: EditorModel) => void;
  setSelected: (s: MapperSelectedInterface) => void;
  onMove: () => void;
}> = ({
  className,
  viewOption,
  mapSet,
  onMapSetChanged,
  modelProps,
  setProps,
  mapResult = {},
  onModelChanged,
  setSelected,
  onMove,
}) => {
  const { logger, useDecodedBlob, requestFileFromFilesystem } =
    useContext(DatasetContext);

  const modelType = modelProps.modelType;  

  function setSelectedId(id: string) {
    setSelected({
      modelType: modelProps.modelType,
      selected: id,
    });
  }

  function onLoad(params: OnLoadParams) {
    params.fitView();
  }

  function setNewModelWrapper(mw: ModelWrapper) {
    setProps({
      ...modelProps,
      history: createPageHistory(mw),
      modelWrapper: mw,
    });
    onModelChanged(mw.model);
    setSelectedId('');
  }

  function onDragOver(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }

  function onPageChange(updated: PageHistory, newPage: string) {
    modelProps.history = updated;
    modelProps.modelWrapper.page = newPage;
    setProps({ ...modelProps });
  }

  function onProcessClick(pageid: string, processid: string): void {
    const mw = modelProps.modelWrapper;
    mw.page = pageid;
    logger?.log('Go to page', pageid);
    addToHistory(modelProps.history, mw.page, processid);
    setProps({ ...modelProps });
    setSelectedId('');
  }

  function drillUp(): void {
    if (modelProps.history.items.length > 0) {
      modelProps.modelWrapper.page = popPage(modelProps.history);
      setProps({ ...modelProps });
      setSelectedId('');
    }
  }  

  function setMapping(fromid: string, toid: string) {
    logger?.log(`Update mapping from ${fromid} to ${toid}`);
    if (mapSet.mappings[fromid] === undefined) {
      mapSet.mappings[fromid] = {};
    }
    mapSet.mappings[fromid][toid] = {
      description: '',
      justification: '',
    };
    onMapSetChanged({ ...mapSet });
  }

  const toolbar = (
    <ControlGroup>
      <MGDButton
        onClick={() => {
          handleModelOpen({
            setNewModelWrapper,
            useDecodedBlob,
            requestFileFromFilesystem,
            logger,
            indexModel,
          });
        }}
      >
        {'Open ' + MapperModelLabel[modelProps.modelType as MapperModelType]}
      </MGDButton>
      <MGDButton
        type={MGDButtonType.Secondary}
        disabled={modelProps.history.items.length <= 1}
        onClick={drillUp}
      >
        Drill up
      </MGDButton>
    </ControlGroup>
  );

  const ComponentShortDescription: React.FC<{id: string}> = function ({id}) {
    return <ComponentSummary id={id} model={modelProps.modelWrapper.model} />
  }

  const breadcrumbs = getBreadcrumbs(modelProps.history, onPageChange);

  return (
    <ReactFlowProvider>
      <Workspace
        className={className}
        toolbar={toolbar}        
        navbarProps={{ breadcrumbs }}
      >
        <div css={react_flow_container_layout}>
          <ReactFlow
            key="MMELModel"
            elements={getMapperReactFlowElementsFrom(
              modelProps.modelWrapper,
              modelProps.modelType,
              viewOption.dataVisible,
              onProcessClick,
              setMapping,
              mapSet,
              mapResult,
              setSelectedId,
              isParentMapFullCovered(modelProps.history, mapResult),
              ComponentShortDescription
            )}
            onLoad={onLoad}
            onDragOver={onDragOver}
            onMove={onMove}
            nodesConnectable={false}
            snapToGrid={true}
            snapGrid={[10, 10]}
            nodeTypes={NodeTypes}
            edgeTypes={EdgeTypes}
            nodesDraggable={false}
          ></ReactFlow>          
          {viewOption.legVisible && (
            <MappingLegendPane
              list={
                modelType === ModelType.REF
                  ? MappingResultStyles
                  : MappingSourceStyles
              }
              onLeft={modelType === ModelType.IMP}
            />
          )}
        </div>
      </Workspace>
    </ReactFlowProvider>
  );
};

export default ModelDiagram;
