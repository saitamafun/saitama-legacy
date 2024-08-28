import { useRouter } from "next/navigation";
import { MdCheckCircle } from "react-icons/md";

type LoginSuccessProps = {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function LoginSuccess({ show }: LoginSuccessProps) {
  const router = useRouter();

  return (
    <>
      {show && (
        <section className="flex-1 flex flex-col">
          <div className="m-auto flex flex-col items-center justify-center space-y-4">
            <div className="relative flex bg-emerald-100 p-3 rounded-full dark:bg-green-100 ">
              <MdCheckCircle className="z-10  text-emerald-500 text-4xl dark:text-emerald-500" />
              <div className="self-center absolute ml-2 w-6 h-6  bg-white rounded-full z-0 dark:bg-white" />
            </div>
            <div className="flex flex-col items-center justify-center text-center">
              <p className="text-xl font-medium">Welcome</p>
              <p className="text-black/75 dark:text-white/75">
                You've successfully logged in.
              </p>
            </div>
            <button
              className="btn btn-primary px-4 py-2"
              onClick={() => router.refresh()}
            >
              Open Wallet
            </button>
          </div>
        </section>
      )}
    </>
  );
}
