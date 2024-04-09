import { IconArrowBarLeft, IconArrowBarRight } from '@tabler/icons-react';
import { useRouter } from 'next/router';

interface Props {
  onClick: any;
  side: 'left' | 'right';
}

export const CloseSidebarButton = ({ onClick, side }: Props) => {
  const router = useRouter();
  const locale = router.locale;
    return (
    <>
      <button
        className={`fixed top-5 ${
          locale=== 'he' ? 'right-[270px]' : 'left-[270px]'
        } z-50 h-7 w-7 hover:text-gray-400 dark:text-white dark:hover:text-gray-300 sm:top-0.5 sm:${
          locale=== 'he' ? 'right-[270px]' : 'left-[270px]'
        } sm:h-8 sm:w-8 sm:text-neutral-700`}
        onClick={onClick}
      >
        {locale==='he' ? < IconArrowBarRight/> : <IconArrowBarLeft />}
      </button>
      <div
        onClick={onClick}
        className="absolute top-0 left-0 z-10 h-full w-full bg-black opacity-70 sm:hidden"
      ></div>
    </>
  );
};

export const OpenSidebarButton = ({ onClick, side }: Props) => {
  const router = useRouter();
  const locale = router.locale;
  if(side === 'right'){
    return (
      <></>
    );
  }
  return (
    <button
      className={locale === 'en' ? `fixed top-2.5 left-2 z-50 h-7 w-7 text-white hover:text-gray-400 dark:text-white dark:hover:text-gray-300 sm:top-0.5 sm:left-2
      sm:h-8 sm:w-8 sm:text-neutral-700` : `fixed top-2.5 right-2 z-50 h-7 w-7 text-white hover:text-gray-400 dark:text-white dark:hover:text-gray-300 sm:top-0.5 sm:right-2
    sm:h-8 sm:w-8 sm:text-neutral-700`}
      onClick={onClick}
    >
      {locale === 'he' ? (
        <IconArrowBarLeft />
        ) : (
        <IconArrowBarRight />
      )}
    </button>
  );
};
