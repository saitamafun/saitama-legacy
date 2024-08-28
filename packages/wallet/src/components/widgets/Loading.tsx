import clsx from "clsx";

type LoadingProps = {
  className?: string;
  inverted?: boolean;
};

export default function Loading({ className, inverted }: LoadingProps) {
  return (
    <div
      className={clsx(
        className,
        "m-auto w-6 h-6 border-2  rounded-full animate-spin",
        inverted
          ? " border-white border-t-transparent dark:border-t-transparent dark:border-black"
          : "border-t-transparent border-black dark:border-white dark:border-t-transparent"
      )}
    />
  );
}
