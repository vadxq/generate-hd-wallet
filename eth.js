const bip39 = require('bip39');
const { hdkey } = require('ethereumjs-wallet');
const util = require('ethereumjs-util');
const args = process.argv.slice(2);
console.log(args);

// 1.mnemonic生成助记词.第一次使用的时候
// English mnemonic
let mnemonic = bip39.generateMnemonic();
// 中文助记词
// let mnemonic = bip39.generateMnemonic(128, null, bip39.wordlists.chinese_simplified)

// 2.将助记词转成seed
const getSeed = async () => {
  let seed = await bip39.mnemonicToSeed(mnemonic, args[0]);
	// 如果已经有了助记词，想复原地址，那么用这一行
  // let seed = await bip39.mnemonicToSeed(args[1], args[0]);
  console.log('seed：' + util.bufferToHex(seed));
  return seed;
};
// 3.提取私钥，公钥，账户
const obtainAccount = async () => {
  let seed = await getSeed();
  // hdkey将seed生成HD Wallet
  let hdWallet = await hdkey.fromMasterSeed(seed);

  for (let i = 0; i < 5; i++) {
    // 生成钱包中在m/44'/60'/0'/0/i路径的keypair ethereum
    let key = await hdWallet.derivePath("m/44'/60'/0'/0/" + i);
    // 从keypair中获取私钥
    console.log('私钥：' + util.bufferToHex(key._hdkey._privateKey));
    // 从keypair中获取公钥
    console.log('公钥：' + util.bufferToHex(key._hdkey._publicKey));
    // 使用keypair中的公钥生成地址
    let address = await util.pubToAddress(key._hdkey._publicKey, true);
    //编码地址
    console.log('account', i + 1, '0x' + address.toString('hex'));

    console.log('- - - - - - - - - - - - - - - - - - - - - -');
  }
};

obtainAccount();