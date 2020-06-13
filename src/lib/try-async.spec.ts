import test from 'ava';
import { Try } from './try';
import { TryAsync } from './try-async';

test('map() runs fn on inner try', async t => {
  const tryA = Try.success('HELLO');
  const result = await TryAsync.of(Promise.resolve(tryA))
    .map(str => str + ' WORLD!!!')
    .promise();
  t.deepEqual(result.get(), 'HELLO WORLD!!!');
});

test('map() leaves the inner failure', async t => {
  const error = new Error('Expected Failure');
  const tryA = Try.failure<string>(error);
  const result = await TryAsync.of(Promise.resolve(tryA))
    .map(str => str + ' WORLD!!!')
    .promise();
  t.truthy(result.isFailure());
  t.throws(() => result.get(), error.message);
});

test('map() catches exceptions and converts them to failures', async t => {
  const error = new Error('Expected Failure');
  const tryA = Try.success('HELLO');
  const result = await TryAsync.of(Promise.resolve(tryA))
    .map(() => {
      throw error;
    })
    .promise();
  t.truthy(result.isFailure());
  t.throws(() => result.get(), error.message);
});

test('flatMap() returns inner success', async t => {
  const tryA = Try.success('HELLO');
  const result = await TryAsync.of(Promise.resolve(tryA))
    .flatMap(str => Try.success(str + ' WORLD!!!'))
    .promise();
  t.deepEqual(result.get(), 'HELLO WORLD!!!');
});

test('flatMap() returns inner failure', async t => {
  const error = new Error('expected failure');
  const tryA = Try.success('HELLO');
  const result = await TryAsync.of(Promise.resolve(tryA))
    .flatMap(() => Try.failure(error))
    .promise();
  t.truthy(result.isFailure());
  t.throws(() => result.get(), error.message);
});

test('flatMap() does not run fn on inner failure', async t => {
  const error = new Error('expected failure');
  const tryA = Try.failure(error);
  const result = await TryAsync.of(Promise.resolve(tryA))
    .flatMap(() => Try.success('foobar'))
    .promise();
  t.truthy(result.isFailure());
  t.throws(() => result.get(), error.message);
});

test('flatMap() returns failure on inner throw', async t => {
  const error = new Error('expected failure');
  const tryA = Try.success('foobar');
  const result = await TryAsync.of(Promise.resolve(tryA))
    .flatMap(() => {
      throw error;
    })
    .promise();
  t.truthy(result.isFailure());
  t.throws(() => result.get(), error.message);
});

test('mapAsync() wraps resolved promise', async t => {
  const tryA = Try.success('hello');
  const result = await TryAsync.of(Promise.resolve(tryA))
    .mapAsync(str => Promise.resolve(str + ' world'))
    .promise();
  t.deepEqual(result.get(), 'hello world');
});

test('mapAsync() wraps failed promise', async t => {
  const tryA = Try.success('hello');
  const result = await TryAsync.of(Promise.resolve(tryA))
    .mapAsync(() => Promise.reject('expected error'))
    .promise();
  t.deepEqual(result.isFailure(), true);
});

test('mapAsync() wraps failed fn', async t => {
  const tryA = Try.success('Hello');
  const res = await TryAsync.of(Promise.resolve(tryA))
    .mapAsync(() => {
      throw new Error('expected errro');
    })
    .promise();
  t.deepEqual(res.isFailure(), true);
});

test('flatMapAsync() wraps a failed promise', async t => {
  const tryA = Try.success(100);
  const tryF = Try.failure(new Error('expected failure'));
  const res = await TryAsync.of(Promise.resolve(tryA))
    .flatMapAsync(() => TryAsync.of(Promise.resolve(tryF)))
    .promise();
  t.truthy(res.isFailure());
});

test('flatMapAsync() maps inner fn', async t => {
  const tryA = Try.success(100);
  const res = await TryAsync.of(Promise.resolve(tryA))
    .flatMapAsync(a => TryAsync.of(Promise.resolve(Try.success(a + 100))))
    .promise();
  t.deepEqual(res.get(), 200);
});
