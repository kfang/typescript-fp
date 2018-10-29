// tslint:disable:no-expression-statement
import test from 'ava';
import { Optional } from './optional';

test('isEmpty() should return true for undefined', t => {
    const opt = Optional.of(undefined);
    t.truthy(opt.isEmpty());
});

test('isEmpty() should return true for null', t => {
    const opt = Optional.of(null);
    t.truthy(opt.isEmpty());
});

test('isEmpty() should return true for something mapped to undefined', t => {
    const opt = Optional.of({a: undefined}).map(o => o.a);
    t.truthy(opt.isEmpty());
})
