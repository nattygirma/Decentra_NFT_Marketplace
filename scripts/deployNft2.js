const main = async () => {
  const domainContractFactory = await hre.ethers.getContractFactory("Domains");
  const domainContract = await domainContractFactory.deploy("nat");
  await domainContract.deployed();

  console.log("Contract deployed to:", domainContract.address);

  const owner = await domainContract.owner();
  console.log("Owner of contract is: ", owner);
  // CHANGE THIS DOMAIN TO SOMETHING ELSE! I don't want to see OpenSea full of bananas lol
  let txn = await domainContract.register("Apple", {
    value: hre.ethers.utils.parseEther("0.1"),
  });
  await txn.wait();
  console.log("Minted domain Apple.nat");

  txn = await domainContract.setRecord("Apple", "Record for Apple.nat");
  await txn.wait();
  console.log("Set record for Apple.nat");

  const address = await domainContract.getAddress("Apple");
  console.log("Owner of domain Apple:", address);

  const balance = await hre.ethers.provider.getBalance(domainContract.address);
  console.log("Contract balance:", hre.ethers.utils.formatEther(balance));
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();
