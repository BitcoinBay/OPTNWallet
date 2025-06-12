// @ts-nocheck
import { decodeCashAddress, encodeCashAddress } from '@bitauth/libauth';

function toTokenAddress(address: string) {
    console.log('toTokenAddress() called for address: ' + address);
    const addressInfo: any  = decodeCashAddress(address);
    console.log('addressInfo: ', addressInfo);
    const pkhPayoutBin = addressInfo.payload;
    console.log('pkhPayoutBin: ', pkhPayoutBin);
    const prefix = addressInfo.prefix;
    console.log('prefix: ', prefix);
    const tokenAddress = encodeCashAddress({
        payload: pkhPayoutBin,
        prefix: prefix,
        type: "p2pkhWithTokens"
    });
    console.log('toTokenAddress() converted to: ' + tokenAddress.address);
    return tokenAddress;
}

export default toTokenAddress;