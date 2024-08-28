import clsx from "clsx";
type LoadingProps = {
  className?: string;
};

export const Loading = ({ className }: LoadingProps) => (
  <div
    className={clsx(
      className,
      "w-6 h-6 border-2 border-t-transparent border-white rounded-full animate-spin"
    )}
  />
);
