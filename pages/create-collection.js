import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useWeb3React } from "@web3-react/core";
import { Formik, Form } from "formik";
import * as yup from "yup";
import useToggleWalletPanel from "../hooks/contexts/useToggleWalletPanel";

import useCreateMultipleNfts from "../hooks/mutations/useCreateMultipleNfts";
import useIpfsUpload from "../hooks/mutations/useIpfsUpload";

import Input from "../components/shared/Input/Input";
import Textarea from "../components/shared/Textarea/Textarea";
import ImageUpload from "../components/shared/ImageUpload/ImageUpload";

import Button from "../components/shared/Button/Button";

// constants
import { INFURA_URL } from "../utils/constants";

const ipfsInfuraUrl = "https://ipfs.io/ipfs";

export default function CreateCollection({ ipfsApiKey }) {
  const [uploadedImages, setUploadedImages] = useState([]);
  const [ipfsUrl, setIpfsUrl] = useState("");

  const { setIsWalletPanelOpen } = useToggleWalletPanel();
  const { active } = useWeb3React();
  const router = useRouter();

  const { createNftsMutation, isLoading } = useCreateMultipleNfts();
  const { ipfsUploadMutation, isLoading: isIpfsLoading } =
    useIpfsUpload(ipfsApiKey);

  /* Make an upload to ipfs and sets ipfsUrl whenever an image is uploaded */
  useEffect(() => {
    const ipfsUploadData = async () => {
      const ipfsData = await ipfsUploadMutation(uploadedImages[0]);
      setIpfsUrl(`${`https://${INFURA_URL}`}/ipfs/${ipfsData.path}`);
    };
    if (uploadedImages.length) {
      ipfsUploadData();
    }
  }, [uploadedImages]);

  /* Clears uploaded images and ipfs url state */
  const handleRemoveAllImages = () => {
    setUploadedImages([]);
    setIpfsUrl("");
  };

  const handleSubmit = async (values) => {
    const { name, description, numberOfItemsInCollection } = values;
    if (!active) {
      return setIsWalletPanelOpen(true);
    }

    const data = JSON.stringify({
      name,
      description,
      image: ipfsUrl,
    });
    const uploadedData = await ipfsUploadMutation(data); // upload name, discription and Image's IpfsUrl and return
    const url = `${ipfsInfuraUrl}/${uploadedData.path}`; // info about uploaded data including URL which the file is uploaded.

    return createNftsMutation(url, numberOfItemsInCollection).then(
      (createNftReceipt) =>
        createNftReceipt.status &&
        router.push(`/nft/${createNftReceipt.tokenId}`)
    );

  };

  const initialValues = {
    name: "",
    description: "",
    numberOfItemsInCollection: 0
  };

  const validationSchema = yup.object().shape({
    name: yup.string().required(),
    description: yup.string().required(),
    numberOfItemsInCollection: yup.number().required(),
  });

  return (
    <div className="flex justify-center md:pt-10">
      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
        validateOnMount
        validationSchema={validationSchema}
      >
        {({ isValid }) => (
          <Form className="w-full p-2 md:w-5/6 md:p-10 xl:w-2/3 2xl:w-3/5 border-2 rounded-lg bg-white">
            <h1 className="py-5 text-2xl font-bold">Create new Collection</h1>
            <div className="flex flex-col lg:flex-row pt-5">
              <ImageUpload
                onSetUploadedImages={setUploadedImages}
                imgPreviewUrl={uploadedImages[0]?.preview || ""}
                handleRemoveImage={handleRemoveAllImages}
                isDisabled={!!uploadedImages[0]?.preview}
                isLoading={isIpfsLoading}
                className="lg:mr-4"
              />
              <div className="flex-1 flex flex-col justify-between pt-2 lg:pt-0">
                <Input
                  name="name"
                  label="Collection name"
                  placeholder="Example: The real raw Mooncake"
                  errorMessage="Asset name is a required field"
                />
                <Textarea
                  name="description"
                  label="Collection description"
                  placeholder="Example: A planet-destroying spatial anomaly that was created by the residual energy of an anti-matter bomb"
                  errorMessage="Asset description is a required field"
                />
                <Input
                  name="numberOfItemsInCollection"
                  label="Number of items in the collection"
                  placeholder="Example: 10000"
                  errorMessage="Number of items is a required field"
                  type="number"
                />
                <Button
                  label="Create Collection"
                  isDisabled={!isValid || !ipfsUrl || isLoading}
                  isLoading={isIpfsLoading || isLoading}
                  className="mt-4 w-full"
                  isTypeSubmit
                  size="lg"
                />
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export async function getServerSideProps() {
  return {
    props: {
      ipfsApiKey: "abe23f0eaf4df0b9ad13a32a74b43f1e",
    },
  };
}
