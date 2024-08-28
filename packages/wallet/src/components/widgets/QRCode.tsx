"use client";

import QRCodeStyling from "qr-code-styling";
import { useEffect, useRef, useState } from "react";

type QRCodeProps = NonNullable<
  ConstructorParameters<typeof QRCodeStyling>[number]
>;

export default function QRCode(props: QRCodeProps) {
  const container = useRef<HTMLDivElement | null>(null);
  const [qrCode, setQrCode] = useState<QRCodeStyling | null>(null);

  useEffect(() => {
    import("qr-code-styling").then((QRCodeStyling) =>
      setQrCode(new QRCodeStyling.default(props))
    );

    return () => qrCode?._canvas?.remove();
  }, [props]);

  useEffect(() => {
    if (container.current && qrCode) {
      qrCode.append(container.current);

      return () => qrCode._canvas?.remove();
    }
  }, [qrCode, container.current]);

  return <div ref={container} />;
}
