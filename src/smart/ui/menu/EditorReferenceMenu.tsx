/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React, { useContext } from 'react';
import { Menu, MenuItem } from '@blueprintjs/core';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import {
  FILE_TYPE,
  handleDocumentOpen,
  handleModelOpen,
} from '../../utils/IOFunctions';
import { ReferenceContent } from '../../model/States';
import { indexModel } from '../../model/mapmodel';

const EditorReferenceMenu: React.FC<{
  setReference: (x: ReferenceContent | undefined) => void;
}> = function ({ setReference }) {
  const { useDecodedBlob, requestFileFromFilesystem } =
    useContext(DatasetContext);

  const canOpen = requestFileFromFilesystem && useDecodedBlob;

  return (
    <Menu>
      <MenuItem
        text="Open Model"
        disabled={!canOpen}
        onClick={() =>
          handleModelOpen({
            setModelWrapper: setReference,
            useDecodedBlob,
            requestFileFromFilesystem,
            indexModel,
          })
        }
        icon="document-open"
      />
      <MenuItem
        text="Open SMART Document"
        onClick={() =>
          handleDocumentOpen({
            setDocument: setReference,
            useDecodedBlob,
            requestFileFromFilesystem,
            fileType: FILE_TYPE.Document,
          })
        }
        icon="floppy-disk"
      />
      <MenuItem
        text="Open XML Document"
        onClick={() =>
          handleDocumentOpen({
            setDocument: setReference,
            useDecodedBlob,
            requestFileFromFilesystem,
            fileType: FILE_TYPE.XML,
          })
        }
        icon="floppy-disk"
      />
      <MenuItem
        text="Close Reference"
        onClick={() => setReference(undefined)}
        icon="import"
      />
    </Menu>
  );
};

export default EditorReferenceMenu;
