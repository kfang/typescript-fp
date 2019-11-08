// tslint:disable:no-expression-statement
import test from 'ava';
import { Optional, Some } from './optional';

test('isEmpty() should return true for undefined', t => {
  const opt = Optional.of(undefined);
  t.truthy(opt.isEmpty());
});

test('isEmpty() should return true for null', t => {
  const opt = Optional.of(null);
  t.truthy(opt.isEmpty());
});

test('isEmpty() should return true for something mapped to undefined', t => {
  const opt = Optional.of({ a: undefined }).map(o => o.a);
  t.truthy(opt.isEmpty());
});

test('contains() should return true if it contains foobar', t => {
  const opt = Optional.of('foobar');
  t.truthy(opt.contains('foobar'));
});

test('contains() should return false if its the wrong value', t => {
  const opt = Optional.of('foobar');
  t.falsy(opt.contains('deadbeef'));
});

test('contains() should return false for a none', t => {
  const opt = Optional.empty<string>();
  t.falsy(opt.contains('foobar'));
});

test('getOrElse() should return inner value if nonempty', t => {
  const opt = Optional.of('foobar');
  const res = opt.getOrElse('deadbeef');
  t.deepEqual(res, 'foobar');
});

test('getOrElse() should return default value if empty', t => {
  const opt = Optional.empty();
  const res = opt.getOrElse('deadbeef');
  t.deepEqual(res, 'deadbeef');
});

test('map() should return the inner value', t => {
  const opt = Optional.of({ a: { b: 'foobar' } });
  const res = opt.map(o => o.a).map(o => o.b);
  t.truthy(res.contains('foobar'));
});

test('map() should be empty if null', t => {
  const opt = Optional.of({ a: null });
  const res = opt.map(o => o.a);
  t.truthy(res.isEmpty());
});

test('map() should map over empty', t => {
  const opt = Optional.of(null);
  const res = opt.map(o => o);
  t.truthy(res.isEmpty());
});

test('pMap() should wrap a nonempty promise', async t => {
  const opt = Optional.of('foobar');
  const res = await opt.pMap(s => Promise.resolve(s));
  t.truthy(res.contains('foobar'));
});

test('pMap() should wrap an empty', async t => {
  const opt = Optional.empty();
  const res = await opt.pMap(s => Promise.resolve(s));
  t.truthy(res.isEmpty());
});

test('get() should throw on empty', t => {
  const opt = Optional.empty();
  t.throws(() => opt.get());
});

test('get() should return inner value', t => {
  const opt = Optional.of('foobar');
  t.deepEqual(opt.get(), 'foobar');
});

test('flatMap() should return inner', t => {
  const opt = Optional.of({ a: 'foobar' });
  const res = opt.flatMap(o => Optional.of(o.a));
  t.truthy(res.contains('foobar'));
});

test('flatMap() should return empty', t => {
  const opt = Optional.of({ a: null });
  const res = opt.flatMap(o => Optional.of(o.a));
  t.truthy(res.isEmpty());
});

test('flatMap() should work over empty', t => {
  const opt = Optional.of(null);
  const res = opt.flatMap(a => Optional.of(a));
  t.truthy(res.isEmpty());
});

test('flatten() should return object without nulls', t => {
  const obj = {
    a: Optional.of('foobar'),
    b: Optional.of('deadbeef'),
    c: Optional.of(null),
    d: Optional.of(undefined)
  };
  const res = Optional.flatten(obj);
  t.deepEqual(res, {
    a: 'foobar',
    b: 'deadbeef'
  });
});

test('exists() should return false on a None', t => {
  const res = Optional.empty().exists(() => true);
  t.false(res);
});

test('exists() should return true if the function passed returns true', t => {
  const res = Optional.of('foobar').exists(s => s === 'foobar');
  t.true(res);
});

test('exists() should return false if the function passed returns false', t => {
  const res = Optional.of('foobar').exists(s => s === 'hello world');
  t.false(res);
});

test('constructing a Some with null throws', t => {
  const fn = () => new Some<string>((null as unknown) as string);
  t.throws(fn);
});

test('should return hello world', t => {
  const e = new Error();
  const v: string = Optional.of('hello world').getOrThrow(e);
  t.is(v, 'hello world');
});

test('should throw an error', t => {
  const e = new Error();
  const o = Optional.empty<string>();
  t.throws(() => o.getOrThrow(e));
});

test('getOrNull() should return inner value', t => {
  const res = Optional.of('HELLO').getOrNull();
  t.is(res, 'HELLO');
});

test('getOrNull() should return null', t => {
  const res = Optional.empty<string>().getOrNull();
  t.is(res, null);
});

test('getOrUndefined() should return inner value', t => {
  const res = Optional.of('HELLO').getOrUndefined();
  t.is(res, 'HELLO');
});

test('getOrUndefeind() should return undefined', t => {
  const res = Optional.empty<string>().getOrUndefined();
  t.is(res, undefined);
});
