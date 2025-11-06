import { describe, it, expect } from 'vitest';
import * as api from '../lib/api';

describe('lib/api stability contract', () => {
  it('exports venue functions', () => {
    expect(api.getVenues).toBeTypeOf('function');
    expect(api.getVenue).toBeTypeOf('function');
    expect(api.listPeopleForVenue).toBeTypeOf('function');
    expect(api.getPeople).toBeTypeOf('function');
    expect(api.getPerson).toBeTypeOf('function');
  });
  it('exports likes functions', () => {
    expect(api.ensureDemoLikesSeed).toBeTypeOf('function');
    expect(api.likePerson).toBeTypeOf('function');
    expect(api.isMatched).toBeTypeOf('function');
    expect(api.listMatches).toBeTypeOf('function');
  });
  it('exports chat functions', () => {
    expect(api.ensureDemoThreadsSeed).toBeTypeOf('function');
    expect(api.ensureChat).toBeTypeOf('function');
    expect(api.getThread).toBeTypeOf('function');
    expect(api.getLastMessage).toBeTypeOf('function');
  });
});
