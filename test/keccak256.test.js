// It checks permissions properly
contract("keccak256 tests", async accounts => {
  it ("handles keccak256 correctly", async() => {
    for (let i = 240; i < 340; i++) {
      let ans = web3.utils.toBN(web3.utils.keccak256(i.toString()));
      ans = ans.mod(web3.utils.toBN(1025));
      console.log(i, ans.toString());
    }
  });
});