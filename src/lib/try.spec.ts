// tslint:disable:no-expression-statement
import test from 'ava';
import { Try } from './try';

test('isSuccess() should return true on non error', t => {
  const res = Try.of(() => 'foobar');
  t.truthy(res.isSuccess());
  t.truthy(Try.isSuccess(res));
});

test('isSuccess() should return false on error', t => {
  const res = Try.of(() => {
    throw new Error();
  });
  t.falsy(res.isSuccess());
  t.falsy(Try.isSuccess(res));
});

test('isFailure() should return false on non error', t => {
  const res = Try.of(() => 'foobar');
  t.falsy(res.isFailure());
  t.falsy(Try.isFailure(res));
});

test('isFailure() should return true on error', t => {
  const res = Try.of(() => {
    throw new Error();
  });
  t.truthy(res.isFailure());
  t.truthy(Try.isFailure(res));
});

test('get() should return the value on non error', t => {
  const res = Try.of(() => 'foobar');
  t.deepEqual(res.get(), 'foobar');
});

test('get() should throw error on error', t => {
  const res = Try.of(() => {
    throw new Error();
  });
  t.throws(() => res.get());
});

test('getOrElse() should return the value on non error', t => {
  const res = Try.of(() => 'foobar');
  t.deepEqual(res.getOrElse('deadbeef'), 'foobar');
});

test('getOrElse() should return the default value on error', t => {
  const res = Try.of<string>(() => {
    throw new Error();
  });
  t.deepEqual(res.getOrElse('deadbeef'), 'deadbeef');
});

test('toOptional() should return a nonempty Optional with the value', t => {
  const res = Try.of(() => 'foobar').toOptional();
  t.falsy(res.isEmpty());
  t.truthy(res.contains('foobar'));
  t.deepEqual(res.get(), 'foobar');
});

test('toOptional() should return an empty Optional', t => {
  const res = Try.of(() => {
    throw new Error();
  }).toOptional();
  t.truthy(res.isEmpty());
  t.throws(() => res.get());
});

test('pOf should return a Success on successful Promise', async t => {
  const res = await Try.pOf(() => Promise.resolve('foobar'));
  t.truthy(res.isSuccess());
  t.deepEqual(res.get(), 'foobar');
});

test('pOf should returna Failure on rejected Promise', async t => {
  const res = await Try.pOf(() => Promise.reject(new Error()));
  t.falsy(res.isSuccess());
  t.throws(() => res.get());
});

test('pOf should return Failure if function throws before Promise', async t => {
  const res = await Try.pOf(() => {
    throw new Error();
  });
  t.falsy(res.isSuccess());
  t.throws(() => res.get());
});

test('recover should run and return success if try failed', t => {
  const res = Try.of<string>(() => {
    throw new Error();
  }).recover(() => {
    return 'foobar';
  });
  t.truthy(res.isSuccess());
  t.deepEqual(res.get(), 'foobar');
});

test('recover should not run if try succeeded', t => {
  const res = Try.of(() => 'foobar').recover(() => {
    t.fail();
    return 'deadbeef';
  });
  t.truthy(res.isSuccess());
  t.deepEqual(res.get(), 'foobar');
});

test('recoverWith() should not run if try succeeded', t => {
  const res = Try.of(() => 'foobar').recoverWith(() => {
    t.fail();
    return Try.of(() => 'deadbeef');
  });
  t.truthy(res.isSuccess());
  t.deepEqual(res.get(), 'foobar');
});

test('recoverWith() should run if try failed', t => {
  const res = Try.of<string>(() => {
    throw new Error('error');
  }).recoverWith(e => {
    t.deepEqual(e, new Error('error'));
    return Try.of(() => 'deadbeef');
  });
  t.truthy(res.isSuccess());
  t.deepEqual(res.get(), 'deadbeef');
});

test('map() should convert value on success', t => {
  const res = Try.of(() => ({ foo: 'bar' })).map(o => o.foo);
  t.truthy(res.isSuccess());
  t.deepEqual(res.get(), 'bar');
});

test('map() should not convert value on failure', t => {
  const res = Try.of<any>(() => {
    throw new Error();
  }).map(o => o.foo);

  t.truthy(res.isFailure());
});

test('flatMap() should convert value on success', t => {
  const res = Try.of(() => ({ foo: 'bar' })).flatMap(o => Try.of(() => o.foo));

  t.truthy(res.isSuccess());
  t.deepEqual(res.get(), 'bar');
});

test('flatMap should return failure on failure', t => {
  const res = Try.of(() => ({ foo: 'bar' })).flatMap(() =>
    Try.of(() => {
      throw new Error();
    })
  );

  t.truthy(res.isFailure());
});

test('flatMap should return failure from a failure', t => {
  const res = Try.of(() => {
    throw new Error();
  }).flatMap(() => {
    t.fail("this shouldn't run");
    return Try.of(() => ({ foo: 'bar' }));
  });

  t.truthy(res.isFailure());
});

test('pMap() should return a wrapped failure on exception not in promise', async t => {
  const res = await Try.success('hello').pMap(() => {
    throw new Error();
  });
  t.truthy(res.isFailure());
});

test('pMap() should return a wrapped failure on failed promise', async t => {
  const res = await Try.success('hello').pMap(() => Promise.reject('FAILED'));
  t.truthy(res.isFailure());
});

test('pMap() returns a success on successful promise', async t => {
  const res = await Try.success('HELLO').pMap(() => Promise.resolve('WORLD'));
  t.truthy(res.isSuccess());
  t.deepEqual(res.get(), 'WORLD');
});

test('pMap() passes along the error', async t => {
  const res = await Try.failure(new Error()).pMap(() => Promise.resolve('foobar'));
  t.truthy(res.isFailure());
})
