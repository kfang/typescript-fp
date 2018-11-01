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
