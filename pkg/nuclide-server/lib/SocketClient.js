'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Transport} from './serviceframework/types';

import {SERVICE_FRAMEWORK3_CHANNEL} from './config';
import ServiceFramework from './serviceframework/index';
import invariant from 'assert';

import {ObjectRegistry} from './serviceframework/ObjectRegistry';

// Per-Client state on the Server for the RPC framework
export class SocketClient<TransportType: Transport> {
  _serverComponent: ServiceFramework.ServerComponent;
  _objectRegistry: ObjectRegistry;
  _transport: TransportType;

  constructor(
    serverComponent: ServiceFramework.ServerComponent,
    transport: TransportType,
  ) {
    this._objectRegistry = new ObjectRegistry('server');
    this._serverComponent = serverComponent;
    this._transport = transport;
    transport.onMessage(message => {
      invariant(message.protocol && message.protocol === SERVICE_FRAMEWORK3_CHANNEL);
      this._serverComponent.handleMessage(this, message);
    });
  }

  getMarshallingContext(): ObjectRegistry {
    return this._objectRegistry;
  }

  getTransport(): TransportType {
    return this._transport;
  }

  dispose(): void {
    this._transport.close();
    this._objectRegistry.dispose();
  }
}
