# HD钱包

## 助记词泄漏

还有一种钓鱼网站，会迷惑你交出你的助记词，从而导致整个钱包账户进入风险之中。那么我们对于自己的助记词一定一定不能告诉第三方！当然，我们也可以自己生成一个HD钱包，而且多生成几次，还可以生成一个稍微好看点的钱包地址！我就是一个为了一个稍微好看的钱包地址生成了好多遍的无聊人士。

## 钱包地址原理

钱包地址的原理,大家可以看参考文章[4][https://huangwenwei.com/blogs/bip32-bip39-and-hd-wallet](https://huangwenwei.com/blogs/bip32-bip39-and-hd-wallet)去详细阅读，这里就只简单介绍一下：

钱包的组成：

**Address + Private key = Wallet**

根据密钥之间是否有关联可把钱包分为两类：**nondeterministic wallet** 和 **deterministic wallet**

- nondeterministic wallet：密钥对之间没有关联
- deterministic wallet: 密钥对由一个原始的种子主密钥推导而来。最常见的推导方式是树状层级推导 (hierarchical deterministic) 简称 HD

目前HD钱包是大多是比如imToken钱包应用等采用的。遵循BIP32/39协议，

BIP32就是：**为了避免管理一堆私钥的麻烦提出的分层推导方案。**

根据BIP44协议让地址私钥管理更方便，扩展了对多币种的支持。

BIP0044指定了包含5个预定义树状层级的结构：

```jsx
m / purpose' / coin' / account' / change / address_index
```

**m**是固定的,。**Purpose**也是固定的，值为44（或者 0x8000002C）。**Coin type**这个代表的是币种，0代表比特币，1代表比特币测试链，60代表Ethereum。**Account**代表这个币的账户索引，从0开始。**Change**常量0用于外部(收款地址)，常量1用于内部（也称为找零地址）。外部用于在钱包外可见的地址（例如，用于接收付款）。内部链用于在钱包外部不可见的地址，用于返回交易变更。(所以一般使用0)。**address_index**这就是地址索引，从0开始，代表生成第几个地址，官方建议，每个account下的address_index不要超过20。

## 助记词与HD

这是生成助记词的原理图：粗俗的描述就是通过生成一个128位的随机字符串和4位的随机数，然后得到132位的随机字符串，然后通过进行11位的拆分，得到12个区块，每个区块对应BIP协议词库的一个单词，然后得到一个12个单词的助记词。

![5](https://qnimg.vadxq.com/blog/2022/generate-wallet-anti-theft-5.png)

然后通过助记词来生成也一个512位的种子seed字符串

![6](https://qnimg.vadxq.com/blog/2022/generate-wallet-anti-theft-6.png)

再利用种子生成主地址的公私钥

![7](https://qnimg.vadxq.com/blog/2022/generate-wallet-anti-theft-7.png)

通过bip44协议，可以通过父元素的信息来生成子私钥和子公钥：

![8](https://qnimg.vadxq.com/blog/2022/generate-wallet-anti-theft-8.png)

## 实战生成钱包

这里只是简单的罗列一个eth生成的方式，更多token生成方式，比如BTC/SOLANA/中文助记词等可以查看以下代码库：

[https://github.com/vadxq/generate-hd-wallet](https://github.com/vadxq/generate-hd-wallet)

生成之后，我们就只用导入单个地址的密钥即可。即使这个钱包被盗，也不影响其他钱包，真正实现一个助记词管理多个地址。

```jsx
const bip39 = require('bip39');
const { hdkey } = require('ethereumjs-wallet');
const util = require('ethereumjs-util');
const args = process.argv.slice(2);
console.log(args);

// 1.mnemonic生成助记词.第一次使用的时候
// English mnemonic
let mnemonic = bip39.generateMnemonic();

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
  // 通过hdkey将seed生成HD Wallet
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
```