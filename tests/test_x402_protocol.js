const assert = require('assert');
const { x402Client, x402HTTPClient } = require('@x402-avm/core/client');
const { ExactAvmScheme } = require('@x402-avm/avm/exact/client');
const { toClientAvmSigner, ALGORAND_TESTNET_CAIP2, USDC_TESTNET_ASA_ID } = require('@x402-avm/avm');
const { HTTPFacilitatorClient } = require('@x402-avm/core/server');
const algosdk = require('algosdk');

async function runTests() {
  console.log('=== RUNNING x402 AVM PROTOCOL UNIT TESTS ===');

  // Test 1: Algorand Signer Creation
  console.log('[Test 1] Testing toClientAvmSigner...');
  const acc = algosdk.generateAccount();
  const b64Key = Buffer.from(acc.sk).toString('base64');
  const signer = toClientAvmSigner(b64Key);
  assert.strictEqual(signer.address, acc.addr.toString(), 'Signer address must match algosdk address');
  console.log('  ✓ Signer created with valid Algorand address:', signer.address);

  // Test 2: x402Client registration with ExactAvmScheme
  console.log('[Test 2] Testing x402Client registration for Algorand Testnet...');
  const coreClient = new x402Client().register(ALGORAND_TESTNET_CAIP2, new ExactAvmScheme(signer));
  const httpClient = new x402HTTPClient(coreClient);
  assert.ok(coreClient, 'Client must initialize');
  console.log('  ✓ x402Client registered for:', ALGORAND_TESTNET_CAIP2);

  // Test 3: Parse HTTP 402 Challenge
  console.log('[Test 3] Testing HTTP 402 Payment-Required parsing...');
  const rawHeaderObj = {
    x402Version: 2,
    accepts: [
      {
        scheme: 'exact',
        network: ALGORAND_TESTNET_CAIP2,
        amount: '10000',
        asset: USDC_TESTNET_ASA_ID,
        payTo: 'ZMFK2OI7ZBD2U27ISERZC4S6LKM6WMFJPZQ4MYNJDZ2VNBNMBA67RA22AA',
        maxTimeoutSeconds: 300,
        extra: {
          feePayer: 'ZMFK2OI7ZBD2U27ISERZC4S6LKM6WMFJPZQ4MYNJDZ2VNBNMBA67RA22AA'
        }
      }
    ]
  };
  const b64Header = Buffer.from(JSON.stringify(rawHeaderObj)).toString('base64');
  const parsed = httpClient.getPaymentRequiredResponse((name) => {
    if (name.toLowerCase() === 'payment-required') return b64Header;
    return null;
  });
  assert.strictEqual(parsed.x402Version, 2);
  assert.strictEqual(parsed.accepts[0].scheme, 'exact');
  assert.strictEqual(parsed.accepts[0].network, ALGORAND_TESTNET_CAIP2);
  console.log('  ✓ PaymentRequired header correctly parsed and validated');

  // Test 4: Create Atomic Transaction Payment Payload
  console.log('[Test 4] Testing Algorand atomic transaction payment payload creation...');
  const payload = await httpClient.createPaymentPayload(parsed);
  assert.strictEqual(payload.x402Version, 2);
  assert.ok(payload.payload.paymentGroup, 'Payment group array must exist');
  assert.strictEqual(payload.payload.paymentGroup.length, 2, 'Must contain 2 transactions (Fee Payer + ASA transfer)');
  assert.strictEqual(payload.payload.paymentIndex, 1, 'Payment index must point to client transfer');
  console.log('  ✓ Atomic transaction group created with Fee Payer & ASA transfer');

  // Test 5: Facilitator Connectivity
  console.log('[Test 5] Testing GoPlausible Facilitator communication...');
  const facilitator = new HTTPFacilitatorClient({ url: 'https://facilitator.goplausible.xyz' });
  const supported = await facilitator.getSupported();
  assert.ok(supported.kinds.some(k => k.network === ALGORAND_TESTNET_CAIP2), 'Facilitator must support Algorand Testnet');
  console.log('  ✓ GoPlausible Facilitator live and confirmed supporting Algorand Testnet');

  console.log('=== ALL x402 AVM PROTOCOL TESTS PASSED! ===');
}

runTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
