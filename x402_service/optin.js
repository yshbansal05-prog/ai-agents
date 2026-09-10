const algosdk = require('algosdk');

const ALGOD_URL = process.env.ALGOD_TESTNET_URL || 'https://testnet-api.algonode.cloud';
const AVM_PRIVATE_KEY = process.env.AVM_PRIVATE_KEY || '1n0hI3EEHSxE+CnCNoYLuUXegT0mD/MGfHAKp1wTg6kKZAVR2QQSY+sbWR9apx061Ee/xEcuVrsvDUnKhrUTcw==';
const USDC_TESTNET_ASA_ID = 10458941;

async function checkAndOptIn() {
  const secretKey = Buffer.from(AVM_PRIVATE_KEY, 'base64');
  const account = algosdk.mnemonicToSecretKey(algosdk.secretKeyToMnemonic(secretKey));
  const algod = new algosdk.Algodv2('', ALGOD_URL, '');

  console.log(`Checking account: ${account.addr.toString()}`);
  const info = await algod.accountInformation(account.addr).do().catch((e) => {
    console.log('Account information error or unfunded:', e.message);
    return null;
  });

  if (!info) {
    console.log('Account is currently unfunded on Algorand Testnet.');
    console.log(`Dispense Testnet ALGO to: ${account.addr.toString()}`);
    console.log('URL: https://bank.testnet.algorand.network/ or https://dispenser.testnet.aws.algodev.network/');
    return false;
  }

  const algoBalance = Number(info.amount || 0) / 1e6;
  console.log(`ALGO Balance: ${algoBalance} ALGO`);

  const hasOptedIn = (info.assets || []).some(
    (a) => Number(a.assetId || a['asset-id']) === USDC_TESTNET_ASA_ID
  );

  if (hasOptedIn) {
    console.log(`Account is already opted into USDC (ASA ${USDC_TESTNET_ASA_ID})!`);
    const usdcAsset = info.assets.find(a => Number(a.assetId || a['asset-id']) === USDC_TESTNET_ASA_ID);
    console.log(`USDC Balance: ${Number(usdcAsset.amount || 0) / 1e6} USDC`);
    return true;
  }

  if (algoBalance < 0.2) {
    console.log('Insufficient ALGO balance for opt-in (need >= 0.2 ALGO).');
    return false;
  }

  console.log(`Submitting opt-in transaction for USDC ASA ${USDC_TESTNET_ASA_ID}...`);
  const params = await algod.getTransactionParams().do();
  const addrStr = account.addr.toString();
  const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    sender: addrStr,
    receiver: addrStr,
    assetIndex: USDC_TESTNET_ASA_ID,
    amount: 0,
    suggestedParams: params,
  });

  const signed = txn.signTxn(account.sk);
  const result = await algod.sendRawTransaction(signed).do();
  const txId = result.txId || result.txid || txn.txID();
  console.log(`Opt-in transaction submitted! TxID: ${txId}`);
  console.log(`Verifiable on LoRA: https://lora.algokit.io/testnet/transaction/${txId}`);
  await algosdk.waitForConfirmation(algod, txId, 4);
  console.log('Opt-in successfully confirmed on Algorand Testnet!');
  return true;
}

if (require.main === module) {
  checkAndOptIn().catch(console.error);
}

module.exports = { checkAndOptIn };
