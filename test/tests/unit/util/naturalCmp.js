const {test, assert, insp} = require('scar');
const reqlib = require('../../../util/reqlib');
const {naturalCmp} = reqlib('util');

test('util.naturalCmp()', () => {
    assert.equal(typeof naturalCmp, 'function', 'is function');

    [
        '-1',
        '0',
        '00',
        '000',
        '001',
        '01',
        '02',
        '1',
        '3',
        'a0',
        'a00',
        'a1',
        'a2',
        'a 0',
        'a 00',
        'a 000',
        'a 01',
        'a 1',
        'a 2',
        'a 3',
        'a.1',
        'a.1.0',
        'a.1.1',
        'a.1.1.0',
        'a.1.10',
        'z'
    ].forEach((b, idx, arr) => {
        if (idx === 0) {
            return;
        }
        const a = arr[idx - 1];
        assert.equal(naturalCmp(a, b), -1, `fix#${idx} - ${insp(a)} < ${insp(b)}`);
    });
});
