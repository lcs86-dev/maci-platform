// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  ethereum,
  JSONValue,
  TypedMap,
  Entity,
  Bytes,
  Address,
  BigInt,
} from "@graphprotocol/graph-ts";

export class OwnershipTransferred extends ethereum.Event {
  get params(): OwnershipTransferred__Params {
    return new OwnershipTransferred__Params(this);
  }
}

export class OwnershipTransferred__Params {
  _event: OwnershipTransferred;

  constructor(event: OwnershipTransferred) {
    this._event = event;
  }

  get previousOwner(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get newOwner(): Address {
    return this._event.parameters[1].value.toAddress();
  }
}

export class RecipientAdded extends ethereum.Event {
  get params(): RecipientAdded__Params {
    return new RecipientAdded__Params(this);
  }
}

export class RecipientAdded__Params {
  _event: RecipientAdded;

  constructor(event: RecipientAdded) {
    this._event = event;
  }

  get index(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }

  get id(): Bytes {
    return this._event.parameters[1].value.toBytes();
  }

  get metadataUrl(): string {
    return this._event.parameters[2].value.toString();
  }

  get payout(): Address {
    return this._event.parameters[3].value.toAddress();
  }
}

export class RecipientChanged extends ethereum.Event {
  get params(): RecipientChanged__Params {
    return new RecipientChanged__Params(this);
  }
}

export class RecipientChanged__Params {
  _event: RecipientChanged;

  constructor(event: RecipientChanged) {
    this._event = event;
  }

  get index(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }

  get id(): Bytes {
    return this._event.parameters[1].value.toBytes();
  }

  get metadataUrl(): string {
    return this._event.parameters[2].value.toString();
  }

  get newPayout(): Address {
    return this._event.parameters[3].value.toAddress();
  }
}

export class RecipientRemoved extends ethereum.Event {
  get params(): RecipientRemoved__Params {
    return new RecipientRemoved__Params(this);
  }
}

export class RecipientRemoved__Params {
  _event: RecipientRemoved;

  constructor(event: RecipientRemoved) {
    this._event = event;
  }

  get index(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }

  get id(): Bytes {
    return this._event.parameters[1].value.toBytes();
  }

  get payout(): Address {
    return this._event.parameters[2].value.toAddress();
  }
}

export class BaseRegistry__addRecipientInputRecipientStruct extends ethereum.Tuple {
  get id(): Bytes {
    return this[0].toBytes();
  }

  get metadataUrl(): string {
    return this[1].toString();
  }

  get recipient(): Address {
    return this[2].toAddress();
  }
}

export class BaseRegistry__getRecipientResultValue0Struct extends ethereum.Tuple {
  get id(): Bytes {
    return this[0].toBytes();
  }

  get metadataUrl(): string {
    return this[1].toString();
  }

  get recipient(): Address {
    return this[2].toAddress();
  }
}

export class BaseRegistry extends ethereum.SmartContract {
  static bind(address: Address): BaseRegistry {
    return new BaseRegistry("BaseRegistry", address);
  }

  addRecipient(
    recipient: BaseRegistry__addRecipientInputRecipientStruct,
  ): BigInt {
    let result = super.call(
      "addRecipient",
      "addRecipient((bytes32,string,address)):(uint256)",
      [ethereum.Value.fromTuple(recipient)],
    );

    return result[0].toBigInt();
  }

  try_addRecipient(
    recipient: BaseRegistry__addRecipientInputRecipientStruct,
  ): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "addRecipient",
      "addRecipient((bytes32,string,address)):(uint256)",
      [ethereum.Value.fromTuple(recipient)],
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  getRecipient(index: BigInt): BaseRegistry__getRecipientResultValue0Struct {
    let result = super.call(
      "getRecipient",
      "getRecipient(uint256):((bytes32,string,address))",
      [ethereum.Value.fromUnsignedBigInt(index)],
    );

    return changetype<BaseRegistry__getRecipientResultValue0Struct>(
      result[0].toTuple(),
    );
  }

  try_getRecipient(
    index: BigInt,
  ): ethereum.CallResult<BaseRegistry__getRecipientResultValue0Struct> {
    let result = super.tryCall(
      "getRecipient",
      "getRecipient(uint256):((bytes32,string,address))",
      [ethereum.Value.fromUnsignedBigInt(index)],
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(
      changetype<BaseRegistry__getRecipientResultValue0Struct>(
        value[0].toTuple(),
      ),
    );
  }

  getRegistryMetadataUrl(): string {
    let result = super.call(
      "getRegistryMetadataUrl",
      "getRegistryMetadataUrl():(string)",
      [],
    );

    return result[0].toString();
  }

  try_getRegistryMetadataUrl(): ethereum.CallResult<string> {
    let result = super.tryCall(
      "getRegistryMetadataUrl",
      "getRegistryMetadataUrl():(string)",
      [],
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toString());
  }

  maxRecipients(): BigInt {
    let result = super.call("maxRecipients", "maxRecipients():(uint256)", []);

    return result[0].toBigInt();
  }

  try_maxRecipients(): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "maxRecipients",
      "maxRecipients():(uint256)",
      [],
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  owner(): Address {
    let result = super.call("owner", "owner():(address)", []);

    return result[0].toAddress();
  }

  try_owner(): ethereum.CallResult<Address> {
    let result = super.tryCall("owner", "owner():(address)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  recipientCount(): BigInt {
    let result = super.call("recipientCount", "recipientCount():(uint256)", []);

    return result[0].toBigInt();
  }

  try_recipientCount(): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "recipientCount",
      "recipientCount():(uint256)",
      [],
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }
}

export class AddRecipientCall extends ethereum.Call {
  get inputs(): AddRecipientCall__Inputs {
    return new AddRecipientCall__Inputs(this);
  }

  get outputs(): AddRecipientCall__Outputs {
    return new AddRecipientCall__Outputs(this);
  }
}

export class AddRecipientCall__Inputs {
  _call: AddRecipientCall;

  constructor(call: AddRecipientCall) {
    this._call = call;
  }

  get recipient(): AddRecipientCallRecipientStruct {
    return changetype<AddRecipientCallRecipientStruct>(
      this._call.inputValues[0].value.toTuple(),
    );
  }
}

export class AddRecipientCall__Outputs {
  _call: AddRecipientCall;

  constructor(call: AddRecipientCall) {
    this._call = call;
  }

  get value0(): BigInt {
    return this._call.outputValues[0].value.toBigInt();
  }
}

export class AddRecipientCallRecipientStruct extends ethereum.Tuple {
  get id(): Bytes {
    return this[0].toBytes();
  }

  get metadataUrl(): string {
    return this[1].toString();
  }

  get recipient(): Address {
    return this[2].toAddress();
  }
}

export class ChangeRecipientCall extends ethereum.Call {
  get inputs(): ChangeRecipientCall__Inputs {
    return new ChangeRecipientCall__Inputs(this);
  }

  get outputs(): ChangeRecipientCall__Outputs {
    return new ChangeRecipientCall__Outputs(this);
  }
}

export class ChangeRecipientCall__Inputs {
  _call: ChangeRecipientCall;

  constructor(call: ChangeRecipientCall) {
    this._call = call;
  }

  get index(): BigInt {
    return this._call.inputValues[0].value.toBigInt();
  }

  get recipient(): ChangeRecipientCallRecipientStruct {
    return changetype<ChangeRecipientCallRecipientStruct>(
      this._call.inputValues[1].value.toTuple(),
    );
  }
}

export class ChangeRecipientCall__Outputs {
  _call: ChangeRecipientCall;

  constructor(call: ChangeRecipientCall) {
    this._call = call;
  }
}

export class ChangeRecipientCallRecipientStruct extends ethereum.Tuple {
  get id(): Bytes {
    return this[0].toBytes();
  }

  get metadataUrl(): string {
    return this[1].toString();
  }

  get recipient(): Address {
    return this[2].toAddress();
  }
}

export class RemoveRecipientCall extends ethereum.Call {
  get inputs(): RemoveRecipientCall__Inputs {
    return new RemoveRecipientCall__Inputs(this);
  }

  get outputs(): RemoveRecipientCall__Outputs {
    return new RemoveRecipientCall__Outputs(this);
  }
}

export class RemoveRecipientCall__Inputs {
  _call: RemoveRecipientCall;

  constructor(call: RemoveRecipientCall) {
    this._call = call;
  }

  get index(): BigInt {
    return this._call.inputValues[0].value.toBigInt();
  }
}

export class RemoveRecipientCall__Outputs {
  _call: RemoveRecipientCall;

  constructor(call: RemoveRecipientCall) {
    this._call = call;
  }
}

export class RenounceOwnershipCall extends ethereum.Call {
  get inputs(): RenounceOwnershipCall__Inputs {
    return new RenounceOwnershipCall__Inputs(this);
  }

  get outputs(): RenounceOwnershipCall__Outputs {
    return new RenounceOwnershipCall__Outputs(this);
  }
}

export class RenounceOwnershipCall__Inputs {
  _call: RenounceOwnershipCall;

  constructor(call: RenounceOwnershipCall) {
    this._call = call;
  }
}

export class RenounceOwnershipCall__Outputs {
  _call: RenounceOwnershipCall;

  constructor(call: RenounceOwnershipCall) {
    this._call = call;
  }
}

export class TransferOwnershipCall extends ethereum.Call {
  get inputs(): TransferOwnershipCall__Inputs {
    return new TransferOwnershipCall__Inputs(this);
  }

  get outputs(): TransferOwnershipCall__Outputs {
    return new TransferOwnershipCall__Outputs(this);
  }
}

export class TransferOwnershipCall__Inputs {
  _call: TransferOwnershipCall;

  constructor(call: TransferOwnershipCall) {
    this._call = call;
  }

  get newOwner(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class TransferOwnershipCall__Outputs {
  _call: TransferOwnershipCall;

  constructor(call: TransferOwnershipCall) {
    this._call = call;
  }
}
