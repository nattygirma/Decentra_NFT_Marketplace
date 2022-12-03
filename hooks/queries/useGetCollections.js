import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import formatCollections from "../../utils/formatCollections";

import useEthers from "../contexts/useEthers";

/**
 * hook to get nfts for sale
 * @returns { nfts: [] | array of objects, isLoading: boolean }
 */
const useGetCollections = () => {
  const [collections, setCollections] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const { tokenContract, marketContract } = useEthers();

  const loadCollections = useCallback(async () => {
    setIsLoading(true);

    const data = await marketContract.fetchCollections().catch((error) => {
      toast.error(`${error}`);
      return null;
    });
    // console.log("collection unorganazed: ",data)
    if (data) {
      const formattedCollections = await Promise.all(
        data.map(async (collection) => {
          const tokenUri = await tokenContract.tokenURI((collection.startTokenId.toNumber() + 1));
          const meta = await axios.get(tokenUri)
          return formatCollections(collection,meta);
        })
      );
      setCollections(formattedCollections.reverse());
    }
    setIsLoading(false);
  }, [marketContract, tokenContract]);

  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  return {
    collections,
    isLoadingCollection: isLoading,
  };
};

export default useGetCollections;
