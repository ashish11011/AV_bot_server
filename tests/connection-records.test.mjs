import assert from 'node:assert/strict';
import test from 'node:test';
import { db } from '../dist/db/index.js';
import { handleApiMapping, handleWhatsappNumber } from '../dist/src/controllers/connection-records.controller.js';

const parentId = '11111111-1111-4111-8111-111111111111';
const recordId = '22222222-2222-4222-8222-222222222222';
function response() {
  return { statusCode: 200, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } };
}
async function call(handler, method, body, params = {}) {
  const res = response();
  await handler({ method, body, params: { tenantId: '1', ...params } }, res);
  return res;
}

test('connection record validation and CRUD', async () => {
  const original = { select: db.select, insert: db.insert, update: db.update, delete: db.delete };
  let parentExists = true;
  let rows = [];
  db.select = (fields) => ({ from: () => ({ where: () => fields ? Promise.resolve(parentExists ? [{ id: parentId }] : []) : { orderBy: async () => rows } }) });
  db.insert = () => ({ values: values => ({ returning: async () => { rows = [{ id: recordId, ...values }]; return rows; } }) });
  db.update = () => ({ set: values => ({ where: () => ({ returning: async () => { rows = rows.map(row => ({ ...row, ...values })); return rows; } }) }) });
  db.delete = () => ({ where: () => ({ returning: async () => { const deleted = rows; rows = []; return deleted; } }) });
  try {
    assert.equal((await call(handleApiMapping, 'GET', null, { tenantId: '-1' })).statusCode, 400);
    assert.equal((await call(handleWhatsappNumber, 'DELETE', null, { id: 'invalid' })).statusCode, 400);
    parentExists = false;
    assert.equal((await call(handleApiMapping, 'GET')).statusCode, 404);
    parentExists = true;
    for (const apiMappingType of ['Lead', '', null]) {
      assert.equal((await call(handleApiMapping, 'POST', { apiEndpoint: '/api', apiMappingType, fieldMapping: {} })).statusCode, 400);
    }
    for (const fieldMapping of ['{}', [], null]) {
      assert.equal((await call(handleApiMapping, 'POST', { apiEndpoint: '/api', apiMappingType: 'Account', fieldMapping })).statusCode, 400);
    }
    for (const apiMappingType of ['Account', 'Deals', 'ScheduleBooking']) {
      const created = await call(handleApiMapping, 'POST', { apiEndpoint: '/api', apiMappingType, fieldMapping: { Name: 'customerName' } });
      assert.equal(created.statusCode, 201);
      assert.equal(created.body.data.salesforceConnectId, parentId);
      assert.deepEqual(created.body.data.fieldMapping, { Name: 'customerName' });
    }
    assert.equal((await call(handleApiMapping, 'GET')).body.data.length, 1);
    assert.equal((await call(handleApiMapping, 'PUT', { apiEndpoint: '/updated', apiMappingType: 'Deals', fieldMapping: {} }, { id: recordId })).body.data.apiEndpoint, '/updated');
    assert.equal((await call(handleApiMapping, 'DELETE', null, { id: recordId })).statusCode, 200);
    assert.equal((await call(handleApiMapping, 'GET', null, { id: recordId })).statusCode, 404);
    assert.equal((await call(handleWhatsappNumber, 'POST', { numberId: ' ', phoneNumber: '+123' })).statusCode, 400);
    assert.equal((await call(handleWhatsappNumber, 'POST', { numberId: '123', phoneNumber: '+123' })).body.data.whatsappConnectId, parentId);
    assert.equal((await call(handleWhatsappNumber, 'PUT', { numberId: '456', phoneNumber: '+456' }, { id: recordId })).body.data.numberId, '456');
    assert.equal((await call(handleWhatsappNumber, 'DELETE', null, { id: recordId })).statusCode, 200);
    assert.equal((await call(handleWhatsappNumber, 'DELETE', null, { id: recordId })).statusCode, 404);
    db.insert = () => ({ values: () => ({ returning: async () => { throw { cause: { code: '23505' } }; } }) });
    assert.equal((await call(handleWhatsappNumber, 'POST', { numberId: '123', phoneNumber: '+123' })).statusCode, 409);
  } finally { Object.assign(db, original); }
});
