import { useEffect, useState } from "react";
import useGetCollectionById from "../../hooks/queries/useGetCollectionById"
import useGetNftsInACollection from "../../hooks/queries/useGetNftsInACollection";
import NFTList from "../NFTList/NFTList";


// const propTypes = {
//   nftId: PropTypes.string.isRequired,
// };

const CollectionItem = ({ collectionId }) => {

  const { data, isLoading, refetch } = useGetCollectionById(Number(collectionId));

  const {
    collectionId: CollectionId,
    collectionSize: CollectionSize,
    nftContract: NftContract,
    seller: Seller,
    startTokenId: StartTokenId,
  } = data;

 

  const { nftdatas, isLoadingNfts } = useGetNftsInACollection(CollectionSize, StartTokenId);

  return (
    <>
      <p>NFTs in this collection</p>
      <p>Collection ID: {CollectionId}</p>
      <p>Address of contract: {NftContract}</p>
      <p>Seller of the collction {Seller}</p>
      <NFTList
        nfts={nftdatas}
        isLoading={isLoading}
        emptyListMessage="No assets owned"
      />
    </>
  );
};

// CollectionItem.propTypes = propTypes;

export default CollectionItem;
