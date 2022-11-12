import { useState, useRef } from "react";
import { ethers } from "ethers";
import { toast } from "react-toastify";
import { CRYPTO_CURRENCY } from "../../utils/constants";
import { nftaddress } from "../../config";
import toastUpdate from "../../utils/toastUpdate";

import useEthers from "../contexts/useEthers";

/**
 * hook to buy nft
 * @returns {{buyNftMutation: function}, {isLoading: bool}}
 */
const useTransferNft = () => {
  const [isLoading, setIsLoading] = useState(false);
  const toastRef = useRef(null);
  const { signedMarketContract } = useEthers();

  /** function to buy nft
   * @param {object} nft to be bought
   * @returns {Promise< object {transaction receipt data} >} self-descriptive
   */
  const transferNftMutation = async (tokenId, buyersAddress) => {

    setIsLoading(true);

    toastRef.current = toast("Waiting for transaction approval", {
      isLoading: true,
    });
    console.log("What's up bitches")
    const transaction = await signedMarketContract
      .transferToBuyer(nftaddress, tokenId, buyersAddress)
      .then(async (res) => {
        toastUpdate(
          toastRef.current,
          toast.TYPE.DEFAULT,
          "Processing transaction",
          true
        );
        return res
          .wait()
          .then((transactionReceipt) => {
            toastUpdate(
              toastRef.current,
              toast.TYPE.SUCCESS,
              "Purchase successful!"
            );
            return transactionReceipt;
          })
          .catch((err) => {
            toastUpdate(toastRef.current, toast.TYPE.ERROR, err.message);
            return err;
          });
      })
      .catch((err) => {
        let errorMessage = err.message;
        if (err.data.code === -32000) {
          errorMessage = "Insufficient funds";
        }
        toastUpdate(toastRef.current, toast.TYPE.ERROR, errorMessage);
        return err;
      });

    setIsLoading(false);
    return transaction;
  };

  return { transferNftMutation, isLoading };
};

export default useTransferNft;
