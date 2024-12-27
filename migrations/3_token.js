// const Token = artifacts.require("Token");

// module.exports = async function (deployer) {

//   const deployment = deployer.deploy(Token, "ImposterToken", "1MP0", 10000n * BigInt(1e18));
//   const instance = await deployment.await
//   const newOwner = '0xb3a371DDF31C6548D597ddae66ee9289B3ee462b'
//   await instance.transferOwnership(newOwner)
// };


const Imposter = artifacts.require("Imposter");


module.exports = async function (deployer) {
  const deployment = deployer.deploy(Imposter, "0x0000000000000000000000000000000000000000", 0);
  const instance = await deployment.await
  const newOwner = '0xb3a371DDF31C6548D597ddae66ee9289B3ee462b'
  await instance.transferOwnership(newOwner)
};
