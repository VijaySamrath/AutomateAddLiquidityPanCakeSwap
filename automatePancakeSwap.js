const ethers = require('ethers');
const axios = require('axios');
const PancakeRouterJson = require("./PancakeRouter.json");
const wBNBtokenJson = require("./wBNBToken.json");
const TokenAJson = require("./TokenA.json");

// Replace with your BSC testnet RPC endpoint
const bscTestnetRpcUrl = "https://bsc-testnet.publicnode.com";

// Replace with your testnet private key
const privateKey = 'pvt key';

// BNB address 
const wBNBtoken = "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd";

// TokenA contract address on the BSC testnet
const tokenAddress = '0x3b122cad49C4B8CA7Db193ad3e679aec2B4e3D70';

// Function to buy TokenA with BNB
async function buyToken(tokenAddress,privateKey, amount, numOfPurchase)  {
// Initialize the ethers provider and wallet
const provider = new ethers.providers.JsonRpcProvider(bscTestnetRpcUrl);
const wallet = new ethers.Wallet(privateKey, provider);

// PancakeSwap router contract address on the BSC testnet
const pancakeSwapRouterAddress = '0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3';

const pancakeRouter = new ethers.Contract(
  pancakeSwapRouterAddress,
  PancakeRouterJson,
  wallet
);

  // Contracts for WBNB and TokenA interaction
const wBNBtokenContract = new ethers.Contract(wBNBtoken, wBNBtokenJson, wallet);
const tokenAContract = new ethers.Contract(tokenAddress, TokenAJson, wallet);

  try {
    // Approve PancakeSwap Router to spend WBNB and TokenA on behalf of the wallet
    await wBNBtokenContract.approve(pancakeSwapRouterAddress, ethers.utils.parseEther("1000")); // Approval given in more amount as for POC
    await tokenAContract.approve(pancakeSwapRouterAddress, ethers.utils.parseEther("10000000"));
  } catch (error) {
    console.log(error);
  }

  // Log the wallet's address
  console.log(wallet.address)

  try {

    // Add liquidity to the PancakeSwap pool for the WBNB/TokenA pair
    const tx = await pancakeRouter.addLiquidity(
      wBNBtoken,
      tokenAddress,
      ethers.utils.parseEther("0.01"),
      ethers.utils.parseEther("100"),
      0,
      0,
      wallet.address,
      1696322581
    );
    console.log("Transc success ==>", tx);
  } catch (error) {
    console.log("Error ::=>", error);
  }
      
  // Calculate the totalTokens by multiplying amount and numOfPurchase
  const totalTokens = amount*numOfPurchase

  // Convert totalTokens to Wei (the smallest unit of Ether)
  const totalTokensInWei = ethers.utils.parseUnits(String(totalTokens)) ;
  
  await tokenAContract.mint(wallet.address,totalTokensInWei)

}

// Main loop to continuously check for liquidity additions and buy TokenA
async function main() {

    {
    try {

      // Buy TokenA when liquidity is added
      await buyToken(tokenAddress,privateKey,20,2);

    } catch (error) {
      console.error(`Script error: ${error.message}`);
    }
  }
}

// Start the main loop
main();
