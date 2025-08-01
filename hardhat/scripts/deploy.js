import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying TestContract...");
  
  const TestContract = await ethers.getContractFactory("TestContract");
  const testContract = await TestContract.deploy();
  
  await testContract.deployed();
  
  console.log("✅ TestContract deployed to:", testContract.address);
  console.log("🔗 Transaction hash:", testContract.deployTransaction.hash);
  
  // Verify the contract is working
  const owner = await testContract.owner();
  console.log("👤 Contract owner:", owner);
  
  return testContract.address;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });