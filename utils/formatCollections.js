/* eslint-disable no-underscore-dangle */


const formatCollections = (collection, meta) => ({
  collectionId: collection.collectionId?._isBigNumber
    ? collection.collectionId.toNumber()
    : collection.collectionId,

  collectionSize: collection.collectionSize?._isBigNumber
    ? collection.collectionSize.toNumber()
    : collection.collectionSize,

  nftContract: collection.nftContract || null,

  seller: collection.seller || null,

  startTokenId: collection.startTokenId?._isBigNumber
    ? collection.startTokenId.toNumber()
    : collection.startTokenId,

  image: meta?.data.image || null,
  name: meta?.data.name || null,
  description: meta?.data.description || null,
});


export default formatCollections;
