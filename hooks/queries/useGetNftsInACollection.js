import { useState, useEffect, useCallback } from "react";
import { useWeb3React } from "@web3-react/core";
import { toast } from "react-toastify";
import axios from "axios";
import formatItem from "../../utils/formatItem";

import useEthers from "../contexts/useEthers";

/**
 * hook to get nfts the connected wallet currently owns
 * @returns { data: [] | array of objects, isLoading: boolean }
 */
const useGetNftsInACollection = (CollectionSize, StartTokenId) => {
  const [nfts, setNfts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const { active, account } = useWeb3React();
  const { tokenContract } = useEthers();

  const loadNFTs = useCallback(async () => {
    setIsLoading(true);

    if(typeof StartTokenId !== "undefined" && typeof CollectionSize !== "undefined"){
    let startTokenId= StartTokenId+1;
    const lastId= StartTokenId+CollectionSize;
    console.log(startTokenId,CollectionSize,lastId)
    const data = [];
    let i=1;
    for (
      startTokenId;
      startTokenId <= lastId;
      startTokenId += 1
   ) {
      // console.log(startTokenId)
      data.push({ TokenIds: startTokenId, nftIdInACollection: i});
      i+=1;
   }
   console.log("Data", data);
    
    if (data) {
      const formattedItems = await Promise.all(
        data.map(async (item) => {
          const tokenUri = await tokenContract.tokenURI(item.TokenIds);
          const meta = await axios.get(tokenUri);
          return formatItem({ tokenId: item.TokenIds }, meta, { nftIdInACollection: item.nftIdInACollection});
        })
      );
      console.log("formatedItem: ",formattedItems)
      setNfts(formattedItems);
    }
  }

    setIsLoading(false);
  }, [ CollectionSize, StartTokenId]);

  useEffect(() => {
    loadNFTs();
  }, [loadNFTs]);

  return {
    nftdatas: nfts,
    isLoading,
    refetch: loadNFTs,
  };
};

export default useGetNftsInACollection;
