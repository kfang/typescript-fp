import test from 'ava';
import { Optional } from './optional';
import { OptionalP } from './optionalp';

function testfn(str: string): Promise<Optional<string>> {
  const x: OptionalP<string> = OptionalP.ofP(Optional.of(Promise.resolve(str)));
  return x
    .map(s => s.length)
    .pMap(num => Promise.resolve(num))
    .flatMap(num => Optional.of(['hello', 'world'][num]))
    .get();
}

test('should return hello', t => {
  return testfn('').then(o => t.truthy(o.contains('hello')));
});

test('should return world', t => {
  return testfn('a').then(o => t.truthy(o.contains('world')));
});

test('should return empty', t => {
  return testfn('ab').then(o => t.truthy(o.isEmpty()));
});

test('should return empty over flatmap', async t => {
  const p = await OptionalP.empty().get();
  t.truthy(p.isEmpty());
});
