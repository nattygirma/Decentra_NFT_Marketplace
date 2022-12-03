import { useRouter } from "next/router";
import CollectionItem from "../../components/Collections/CollectionItem";
import Spinner from "../../components/shared/Spinner/Spinner";

const Nft = () => {
  const { query } = useRouter();

  return (
    <>
      {!query.collections ? (
        <div className="flex justify-center items-center flex-1">
          <Spinner size="10" />
        </div>
      ) : (
        <CollectionItem collectionId={query.collections} />
       )} 
    </>
  );
};

export default Nft;
