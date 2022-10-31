const bip39 = require('bip39');
const { Keypair } = require('@solana/web3.js')
const { derivePath } = require('ed25519-hd-key')
const bs58 = require('bs58');
const util = require('ethereumjs-util');
const args = process.argv.slice(2);
console.log(args);

//2.将助记词转成seed
const getSeed = async () => {
  // let seed = await bip39.mnemonicToSeed(mnemonic, args[0]);
  let seed = await bip39.mnemonicToSeed(args[1], args[0]);
  console.log('seed：' + util.bufferToHex(seed));
  return seed;
};
//3.提取私钥，公钥，账户
const obtainAccount = async () => {
  let seed = await getSeed();
  for (let i = 0; i < 2; i++) {
    //4.生成钱包中在m/44'/501'/0'/0/i路径的keypair
    const path = `m/44'/501'/${i}'/0'`;
    const keypair = Keypair.fromSeed(
      derivePath(path, seed.toString("hex")).key
    );
    
    //5.从keypair中获取私钥
    console.log('私钥：' + bs58.encode(keypair.secretKey));
    //6.从keypair中获取公钥
    console.log('公钥：' + keypair.publicKey);
    //7.使用keypair中的公钥生成地址
    //编码地址
    console.log(`${keypair.publicKey.toBase58()}`);

    console.log('- - - - - - - - - - - - - - - - - - - - - -');
  }
};

obtainAccount();
