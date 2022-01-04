import { Button } from '@blueprintjs/core';
import React from 'react';
import MGDButtonGroup from '../../MGDComponents/MGDButtonGroup';

export const ConfirmDialog: React.FC<{
  callback: () => void;
  done: () => void;
  msg: string;
}> = function ({ callback, done, msg }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <p> {msg} </p>
      <MGDButtonGroup>
        <Button intent="danger" icon="confirm" onClick={() => {callback();done();}}>
          Confirm
        </Button>
        <Button icon="disable" onClick={() => done()}>
          Cancel
        </Button>
      </MGDButtonGroup>
    </div>
  );
};
