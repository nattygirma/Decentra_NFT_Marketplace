// import React, { useState } from "react";
// import { Fab, TextareaAutosize } from "@material-ui/core";
// import QrReader from "react-qr-reader";
// // import { ArrowBack } from "@material-ui/icons";
// // import { Link } from "react-router-dom";

// export default function Authenticate() {
//   const [qrscan, setQrscan] = useState("No result");
//   const handleScan = (data) => {
//     if (data) {
//       setQrscan(data);
//     }
//   };
//   const handleError = (err) => {
//     console.error(err);
//   };

//   return (
//     <div>
//       <span>QR Scanner</span>

//       <center>
//         <div style={{ marginTop: 30 }}>
//           <QrReader
//             delay={300}
//             onError={handleError}
//             onResult={handleScan}
//             style={{ height: 240, width: 320 }}
//           />
//         </div>
//       </center>

    //   <TextareaAutosize
    //     style={{ fontSize: 18, width: 320, height: 100, marginTop: 100 }}
    //     rowsMax={4}
    //     defaultValue={qrscan}
    //     value={qrscan}
    //   />
//     </div>
//   );
// }

import React, { useState } from "react";
import { QrReader } from "react-qr-reader";
import { useRouter } from "next/router";

function Authenticate() {
  const [data, setData] = useState("");
    const router = useRouter();
    let isTheCorrectQrCodeScanned = true

      const qrCodeScanned = () => {
        if(!isNaN(data)){
          isTheCorrectQrCodeScanned = true;
          router.push({ pathname: "/nft/[d]", query: { d : data} });
        }else{
          isTheCorrectQrCodeScanned = false;
        }
      }
      if(data!==""){
        qrCodeScanned();
      }

  return (
    <div>
      <div style={{ height: 240, width: 320 }}>
        <p>Please scan QR code</p>
        <QrReader
          onResult={(result, error) => {
            if (!!result) {
              setData(result?.text);
            }

            if (!!error) {
              console.info(error);
            }
          }}
          //this is facing mode : "environment " it will open backcamera of the smartphone and if not found will
          // open the front camera
          constraints={{ facingMode: "environment" }}
          style={{ width: "40%", height: "40%" }}
        />
        {isTheCorrectQrCodeScanned ? (
          <p>{data}</p>
        ) : (
          <div>
          <p>{data}</p>
          <p>Please Scan A correct QR code!!!!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Authenticate;