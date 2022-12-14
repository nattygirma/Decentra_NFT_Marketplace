// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "hardhat/console.sol";

contract NFTMarket is ReentrancyGuard {
  using Counters for Counters.Counter;
  Counters.Counter private _itemIds;
  Counters.Counter private _itemsSold;
  Counters.Counter private _marketItems;
  Counters.Counter private _collectionIds;

  address payable owner;
  uint256 listingPrice = 0.025 ether;

  constructor() {
    owner = payable(msg.sender);
  }

  struct MarketItem {
    uint itemId;
    address nftContract;
    uint256 tokenId;
    address payable seller;
    address payable owner;
    uint256 price;
    bool sold;
    bool listed;
    uint256 timeItemGotListed;
    uint256 timeItemGotSold;
  }

  mapping(uint256 => MarketItem) private idToMarketItem;

  event MarketItemCreated (
    uint indexed itemId,
    address indexed nftContract,
    uint256 indexed tokenId,
    address seller,
    address owner,
    uint256 price,
    bool sold,
    bool listed,
    uint256 timeItemGotListed,
    uint256 timeItemGotSold
  );

  struct Collection {
    uint collectionId;
    uint startTokenId;
    uint256 collectionSize;
    address seller;
    address nftContract;
  }

  mapping(uint256 => Collection) private idToCollection;

  /* Returns the listing price of the contract */
  function getListingPrice() public view returns (uint256) {
    return listingPrice;
  }
  
  /* Places an item for sale on the marketplace */
  function createMarketItem(address nftContract,uint256 tokenId,uint256 price) 
  public payable nonReentrant {
    require(price > 0, "Price must be at least 1 wei");
    require(msg.value == listingPrice, "Price must be equal to listing price");

    _marketItems.increment();
    _itemIds.increment();
    uint256 itemId = _itemIds.current();
  
    idToMarketItem[itemId] = MarketItem(
      itemId,
      nftContract,
      tokenId,
      payable(msg.sender),
      payable(address(0)),
      price,
      false,
      true,
      block.timestamp,
      0
    );

    IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

    emit MarketItemCreated(
      itemId,
      nftContract,
      tokenId,
      msg.sender,
      address(0),
      price,
      false,
      true,
      block.timestamp,
      0
    );
  }

  function createCollection(address nftContract,uint256 currentTokenId,uint256 itemSize, address collectionSeller) public {
    _collectionIds.increment();
    uint256 collectionId = _collectionIds.current();

    idToCollection[collectionId] = Collection(
      collectionId,
      currentTokenId,
      itemSize,
      collectionSeller,
      nftContract
    );

  }

  /* Creates the sale of a marketplace item */
  /* Transfers ownership of the item, as well as funds between parties */
  function createMarketSale(
    address nftContract,
    uint256 itemId
    ) public payable nonReentrant {
    uint price = idToMarketItem[itemId].price;
    uint tokenId = idToMarketItem[itemId].tokenId;
    require(msg.value == price, "Please submit the asking price in order to complete the purchase");

    idToMarketItem[itemId].seller.transfer(msg.value);
    IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);
    idToMarketItem[itemId].owner = payable(msg.sender);
    idToMarketItem[itemId].sold = true;
    idToMarketItem[itemId].listed = false;
    idToMarketItem[itemId].timeItemGotSold = block.timestamp;
    _itemsSold.increment();
    payable(owner).transfer(listingPrice);
  }

  /* Function to remove market sale */
  /* clears idToMarketItem[index] and soft deletes index from mapping*/
  /* transfer ownership of the item back to seller and returns listing fee to seller*/
  function removeMarketSale(
    address nftContract,
    uint256 itemId
    ) public payable nonReentrant {
    uint tokenId = idToMarketItem[itemId].tokenId;
    require(msg.sender == idToMarketItem[itemId].seller, "Only the seller of this item can de-list it");
    IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);
    _marketItems.decrement();
    delete idToMarketItem[itemId];
    idToMarketItem[itemId].listed = false;
    payable(msg.sender).transfer(listingPrice);
  }

  function transferToBuyer (    
    address nftContract,
    uint256 itemId,
    address payable buyer) public payable nonReentrant {
      uint tokenId = idToMarketItem[itemId].tokenId;
      require(msg.sender == idToMarketItem[itemId].seller, "Only the Seller of this product can transfer the NFT");
      IERC721(nftContract).transferFrom(address(this), buyer , tokenId);
        idToMarketItem[itemId].owner = buyer;
        idToMarketItem[itemId].sold = true;
        idToMarketItem[itemId].listed = false;
        idToMarketItem[itemId].timeItemGotSold = block.timestamp;
        _itemsSold.increment();
    }

  /* Returns all unsold market items */
  function fetchMarketItems() public view returns (MarketItem[] memory) {
    uint itemCount = _itemIds.current();
    uint unsoldItemCount = _marketItems.current() - _itemsSold.current();
    uint currentIndex = 0;

    MarketItem[] memory items = new MarketItem[](unsoldItemCount);
    for (uint i = 0; i < itemCount; i++) {
      if (idToMarketItem[i + 1].owner == address(0) && idToMarketItem[i + 1].listed == true) {
        uint currentId = i + 1;
        MarketItem storage currentItem = idToMarketItem[currentId];
        items[currentIndex] = currentItem;
        currentIndex += 1;
      }
    }
    return items;
  }
  function fetchCollections() public view returns (Collection[] memory) {
    uint collectionCount = _collectionIds.current();
    uint currentIndex = 0;

    Collection[] memory collections = new Collection[](collectionCount);
    for (uint i = 0; i < collectionCount; i++) {
        uint currentId = i + 1;
        Collection storage currentCollection = idToCollection[currentId];
        collections[currentIndex] = currentCollection;
        currentIndex += 1;
    }
    return collections;
  }

  function fetchCollectionById(uint256 id) public view returns (Collection memory){
    return idToCollection[id];
  }

  /* Returns only items a user has created */
  function fetchItemsCreated() public view returns (MarketItem[] memory) {
    uint totalItemCount = _itemIds.current();
    uint itemCount = 0;
    uint currentIndex = 0;

    for (uint i = 0; i < totalItemCount; i++) {
      if (idToMarketItem[i + 1].seller == msg.sender) {
        itemCount += 1;
      }
    }

    MarketItem[] memory items = new MarketItem[](itemCount);
    for (uint i = 0; i < totalItemCount; i++) {
      if (idToMarketItem[i + 1].seller == msg.sender) {
        uint currentId = i + 1;
        MarketItem storage currentItem = idToMarketItem[currentId];
        items[currentIndex] = currentItem;
        currentIndex += 1;
      }
    }
    return items;
  }

    function fetchItemsInACollection(uint256 currentTokenId,uint256 itemSize) public view returns (MarketItem[] memory) {
    uint totalItemCount = _itemIds.current();
    uint itemCount = itemSize;
    uint currentIndex = 0;

    for (uint i = 0; i < totalItemCount; i++) {
      if (idToMarketItem[i + 1].seller == msg.sender) {
        itemCount += 1;
      }
    }

    MarketItem[] memory items = new MarketItem[](itemCount);
    for (uint i = 0; i < totalItemCount; i++) {
      if (idToMarketItem[i + 1].seller == msg.sender) {
        uint currentId = i + 1;
        MarketItem storage currentItem = idToMarketItem[currentId];
        items[currentIndex] = currentItem;
        currentIndex += 1;
      }
    }
    return items;
  }

  /** Function to get all listing history of of a given token given token. Excludes de-listings */
  function fetchMarketItemHistory(uint256 _tokenId) public view returns (MarketItem[] memory) {
    uint totalItemCount = _itemIds.current();
    uint itemCount = 0;
    uint currentIndex = 0;

    for (uint i = 0; i < totalItemCount; i++) {
      if (idToMarketItem[i + 1].tokenId == _tokenId) {
        itemCount += 1;
      }
    }

    MarketItem[] memory items = new MarketItem[](itemCount);
    for (uint i = 0; i < totalItemCount; i++) {
      if (idToMarketItem[i + 1].tokenId == _tokenId) {
        uint currentId = i + 1;
        MarketItem storage currentItem = idToMarketItem[currentId];
        items[currentIndex] = currentItem;
        currentIndex += 1;
      }
    }
    return items;
  }

}