import { IForeignKey } from './types';

export class ForeignKey implements IForeignKey {
	constructor(public to: string) { }
}

export class ForeignKeyElement extends ForeignKey {}

export class ForeignKeyArray extends ForeignKey {}
