import { SDKProvider } from "@telegram-apps/sdk-react";
import ClientOnly from "./ClientOnly";

type TelegramClientOnlyProps = React.ComponentProps<typeof ClientOnly> &
  React.PropsWithChildren;

export default function TelegramClientOnly({
  children,
  ...props
}: TelegramClientOnlyProps) {
  return (
    <SDKProvider>
      <ClientOnly {...props}>{children}</ClientOnly>
    </SDKProvider>
  );
}
