import { useState} from "react";
import { useWeb3React } from "@web3-react/core";
import NFTList from "../components/NFTList/NFTList";
import CollectionsList from "../components/CollectionList/CollectionsList"
import useGetMarketNfts from "../hooks/queries/useGetMarketNfts";
import useToggleWalletPanel from "../hooks/contexts/useToggleWalletPanel";
import { ACTION_TYPES } from "../utils/constants";
import useBuyNft from "../hooks/mutations/useBuyNft";
import useRemoveListedNft from "../hooks/mutations/useRemoveListedNft";
import useGetCollections from "../hooks/queries/useGetCollections";

const { REMOVE_ITEM, BUY } = ACTION_TYPES;

export default function Home() {


  const [selectedNft, setSelectedNft] = useState({});
  const [selectedCollection, setSelectedCollection] = useState({});
  const { data, isLoading, refetch } = useGetMarketNfts();
  const { collections, isLoadingCollection } = useGetCollections();
  const { active } = useWeb3React();
  const { setIsWalletPanelOpen } = useToggleWalletPanel();

  const { buyNftMutation, isLoading: isBuyLoading } = useBuyNft();
  const { removeListingNftMutation, isLoading: isRemoveLoading } =
    useRemoveListedNft();
  // useEffect(() => {
  //   console.log("collection organized",collections)
  // }, [collections]);
  //   useEffect(() => {
  //     console.log("nft organized", data);
  //   }, [data]);
  const handleSelectedNFTAction = (nft, action) => {
    if (!active) {
      // Opens wallet panel for user to connect wallet before making a purchase
      return setIsWalletPanelOpen(true);
    }
    setSelectedNft(nft);
    const actions = {
      [REMOVE_ITEM]: () => removeListingNftMutation(nft.itemId),
      [BUY]: () => buyNftMutation(nft),
    };

    return actions[action]().then((res) => {
      setSelectedNft({});
      // Only refetch if user did not cancel the transaction or has insufficient funds
      if (
        res.code === 4001 ||
        (res.code === -32603 && res.data.code === -32000)
      ) {
        return null;
      }
      return refetch();
    });
  };

    const handleSelectedCollectionAction = (nft, action) => {
      if (!active) {
        // Opens wallet panel for user to connect wallet before making a purchase
        return setIsWalletPanelOpen(true);
      }
      setSelectedCollection(nft);
      const actions = {
        [REMOVE_ITEM]: () => removeListingNftMutation(nft.itemId),
        [BUY]: () => buyNftMutation(nft),
      };

      return actions[action]().then((res) => {
        setSelectedCollection({});
        // Only refetch if user did not cancel the transaction or has insufficient funds
        if (
          res.code === 4001 ||
          (res.code === -32603 && res.data.code === -32000)
        ) {
          return null;
        }
        return refetch();
      });
    };

  return (
    <>
      <h1 className="py-5 text-2xl font-bold">Explore NFT Collections</h1>
      <CollectionsList
        collectionInformations={collections}
        nfts={data}
        selectedTokenId={selectedCollection.startTokenId}
        onHandleAction={handleSelectedCollectionAction}
        isActionLoading={isBuyLoading || isRemoveLoading}
        isLoading={isLoadingCollection}
        emptyListMessage="No items in marketplace"
      />

      <h1 className="py-5 text-2xl font-bold">Explore NFTs</h1>
      <NFTList
        nfts={data}
        selectedTokenId={selectedNft.tokenId}
        onHandleAction={handleSelectedNFTAction}
        isActionLoading={isBuyLoading || isRemoveLoading}
        isLoading={isLoading}
        emptyListMessage="No items in marketplace"
      />
    </>
  );
}
