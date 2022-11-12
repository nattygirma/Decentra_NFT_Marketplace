import { useState, useRef } from "react";
import { toast } from "react-toastify";
import useEthers from "../contexts/useEthers";
import toastUpdate from "../../utils/toastUpdate";

/**
 * hook to create nft
 * @returns {{createNftMutation: function}, {isLoading: bool}}
 */
const useCreateMultipleNfts = () => {
  const [isLoading, setisLoading] = useState(false);
  const toastRef = useRef(null);
  const { signedTokenContract } = useEthers();

  /** function to create nft
   * @param {url} nft url to be minted
   * @returns {Promise<{ object {transaction receipt data, tokenId: int}> }
   */
  const createNftsMutation = async (url, numberOfItemsInCollection ) => {
    setisLoading(true);

    toastRef.current = toast("Waiting for transaction approval", {
      isLoading: true,
    });
    const transaction = await signedTokenContract
      .createTokens(url,numberOfItemsInCollection)
      .then(async (res) => {
        toastUpdate(
          toastRef.current,
          toast.TYPE.DEFAULT,
          "Processing transaction",
          true
        );
        const transactionReceipt = await res
          .wait()
          .then((receipt) => {
            toastUpdate(
              toastRef.current,
              toast.TYPE.SUCCESS,
              "NFT minted successfully!"
            );
            return receipt;
          })
          .catch((err) => {
            toastUpdate(toastRef.current, toast.TYPE.ERROR, err.message);
            return err;
          });
          console.log("events[0]",transactionReceipt.events[0]);
          console.log("Events[0].args[2]", transactionReceipt.events[0].args[2]);
          console.log(
            "events[0].args[2].toNumber()",
            transactionReceipt.events[0].args[2].toNumber()
          );
           console.log(
            "events[0].args[2].toNumber()",
            transactionReceipt.events[0].args[2].toNumber()
                    );
        const tokenId = transactionReceipt.events[0].args[2].toNumber();
        return { ...transactionReceipt, tokenId };
      })
      .catch((err) => {
        toastUpdate(toastRef.current, toast.TYPE.ERROR, err.message);
        return err;
      });
    setisLoading(false);
    return transaction;
  };

  return { createNftsMutation, isLoading };
};

export default useCreateMultipleNfts;
