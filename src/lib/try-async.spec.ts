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
