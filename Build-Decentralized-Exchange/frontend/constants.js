import CryptoDevToken from '../artifacts/contracts/CryptoDevToken.sol/CryptoDevToken.json'
import Exchange from '../artifacts/contracts/Exchange.sol/Exchange.json'
export const TOKEN_CONTRACT_ABI = CryptoDevToken.abi
export const TOKEN_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS
export const EXCHANGE_CONTRACT_ABI = Exchange.abi
export const EXCHANGE_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_EXCHANGE_CONTRACT_ADDRESS
