import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import formatCollections from "../../utils/formatCollections";


import useEthers from "../contexts/useEthers";


const useGetCollectionById = (collectionId) => {
  const [collection, setCollection] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const { marketContract } = useEthers();

  const loadNFTs = useCallback(async () => {
    setIsLoading(true);

    const data = await marketContract.fetchCollectionById(collectionId).catch((error) => {
      toast.error(`${error}`);
      return null;
    });
    if (data) {
      const formattedCollections = formatCollections(data);
      setCollection(formattedCollections);
    }

    setIsLoading(false);
  }, [marketContract, collectionId]);

  useEffect(() => {
    loadNFTs();
  }, [loadNFTs]);

  return {
    data: collection,
    isLoading,
    refetch: loadNFTs,
  };
};

export default useGetCollectionById;

