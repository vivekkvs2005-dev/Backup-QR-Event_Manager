import { useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";

import { BrowserMultiFormatReader } from "@zxing/browser";

function ScannerPage() {
  const navigate = useNavigate();

  const [scanError, setScanError] = useState("");
  const [scannerStarted, setScannerStarted] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [scannerStatus, setScannerStatus] = useState("starting");

  async function handleImageUpload(event) {

    const file = event.target.files[0];

    if (!file) return;

    try {

      setScanError("");
      setScannerStatus("starting");

      const imageUrl = URL.createObjectURL(file);

      const codeReader =
        new BrowserMultiFormatReader();

      const result =
        await codeReader.decodeFromImageUrl(imageUrl);

      const decodedText = result.getText();

      const parts =
        decodedText.split("/verify/");

      const token = parts[1];

      if (token) {

        setScannerStatus("success");

        setTimeout(() => {
          navigate(`/verify/${token}`);
        }, 600);

      } else {

        setScannerStatus("error");

        setScanError(
          "Invalid QR format."
        );
      }

    } catch (error) {

      console.error(error);

      setScannerStatus("error");

      setScanError(
        "No valid QR code found in image."
      );
    }
  }

  useEffect(() => {
    let mounted = true;

    const codeReader = new BrowserMultiFormatReader();

    let controls = null;


    async function startScanner() {
      try {
        setScanError("");

        // Get available cameras
        const videoInputDevices =
          await BrowserMultiFormatReader.listVideoInputDevices();

        if (!videoInputDevices.length) {
          setScanError("No camera device found.");
          return;
        }

        // Prefer rear camera on phones
        const rearCamera =
          videoInputDevices.find((device) =>
            device.label.toLowerCase().includes("back")
          ) || videoInputDevices[0];

        if (!mounted) return;

        setScannerStarted(true);
        setScannerStatus("ready");

        controls = await codeReader.decodeFromVideoDevice(
          rearCamera.deviceId,
          "reader",
          (result, err) => {

            // Successful QR detection
            if (result) {
              const decodedText = result.getText();

              try {
                const parts =
                  decodedText.split("/verify/");

                const token = parts[1];

                if (token && !hasScanned) {

                  setHasScanned(true);
                  setScannerStatus("success");

                  if (controls) {
                    controls.stop();
                  }

                  setTimeout(() => {
                    navigate(`/verify/${token}`);
                  }, 600);

                } else if (!token) {

                  setScanError("Invalid QR format.");

                } else {
                  setScanError("Invalid QR format.");
                }

              } catch {
                setScanError(
                  "Failed to process QR code."
                );
              }
            }

            // Ignore continuous frame scan errors
            if (err) {
            }
          }
        );

      } catch (error) {
        console.error(error);

        setScanError(
          "Camera permission denied or scanner failed to start."
        );
        setScannerStatus("error");
      }
    }

    startScanner();

    return () => {
      mounted = false;

      if (controls) {
        controls.stop();
      }
    };

  }, [navigate]);

  return (
    <div className="public-page">
      <div className="card scanner-card">

        <h2 className="card-title">
          🎥 Scan Event Ticket
        </h2>

        <p className="scanner-text">

          {scannerStatus === "starting" &&
            "Starting camera..."}

          {scannerStatus === "ready" &&
            "Ready to scan attendee QR ticket"}

          {scannerStatus === "success" &&
            "QR detected successfully"}

          {scannerStatus === "error" &&
            "Scanner failed to start"}

        </p>

        {scanError && (
          <p className="msg error">
            {scanError}
          </p>
        )}

        {!scannerStarted && (
          <p className="scanner-text">
            Starting camera...
          </p>
        )}

        <video
          id="reader"
          style={{
            width: "100%",
            borderRadius: "12px",
            border: "2px solid #e2e8f0",
          }}
        ></video>

        <div className="upload-divider">
          <span>OR</span>
        </div>

        <div className="upload-section">

          <label
            htmlFor="qr-upload"
            className="btn btn-outline"
          >
            Upload QR Image
          </label>

          <input
            id="qr-upload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: "none" }}
          />

          <p className="scanner-text">
            Upload screenshot or photo of QR ticket
          </p>

</div>

      </div>
    </div>
  );
}

export default ScannerPage;