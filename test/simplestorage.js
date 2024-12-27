const SimpleStorage = artifacts.require("./SimpleStorage.sol");

contract("SimpleStorage", accounts => {
  it("...should store the value 89.", async () => {
    const simpleStorageInstance = await SimpleStorage.deployed();

    // Set value of 89
    await simpleStorageInstance.set(89, { from: accounts[0] });

    // Get stored value
    const storedData = await simpleStorageInstance.get.call();

    assert.equal(storedData, 89, "The value 89 was not stored.");
  });
});

const Imposter = artifacts.require("./Imposter.sol");

contract("Imposter", accounts => {
  it("emit event", async () => {
    const posterInstance = await Imposter.deployed();
    const eventsBefore = await posterInstance.getPastEvents('NewPost')
    assert.deepEqual(eventsBefore, [])
    const content = "Hello, world!"
    const tag = "hello"
    await posterInstance.post(content, tag, {from: accounts[0]})
    const eventsAfter = await posterInstance.getPastEvents('NewPost')
    assert.equal(eventsAfter.length, 1)
    const postedEvent = eventsAfter[0]
    assert.equal(postedEvent.args.user, accounts[0])
    assert.equal(postedEvent.args.content, content)
    assert.equal(postedEvent.args.tag, web3.utils.keccak256(tag))
  });
});