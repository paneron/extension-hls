/**
 * It is the data model of how data instances are stored and associated to the model
 */

import { WSVERSION } from '../utils/constants';
import { JSONContext, JSONContextType } from '../utils/repo/io';

export interface SMARTDocument {
  id: number;
  name: string;
  attributes: Record<string, string>; // according to the definition of the data registry
}

// docs[random number document id]
export interface SMARTDocumentStore {
  id: string; // id of data registry
  docs: Record<number, SMARTDocument>;
}

// store[registry id]
export interface SMARTModelStore {
  id: string; // namespace of the model
  store: Record<string, SMARTDocumentStore>;
}

// docs[model namespace]
export interface SMARTWorkspace {
  '@context': JSONContextType;
  '@type': 'MMEL_WORKSPACE';
  docs: Record<string, SMARTModelStore>;
  version: string;
}

export function createNewSMARTWorkspace(): SMARTWorkspace {
  return {
    '@context' : JSONContext,
    '@type'    : 'MMEL_WORKSPACE',
    'docs'     : {},
    'version'  : WSVERSION,
  };
}
