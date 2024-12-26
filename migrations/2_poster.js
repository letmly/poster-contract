const Imposter = artifacts.require("Imposter");

module.exports = function (deployer) {
  deployer.deploy(Imposter);
};
