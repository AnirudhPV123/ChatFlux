type ProgressBarProps = {
  totalSteps: number;
  currentStepIndex: number;
};
function ProgressBar({ totalSteps, currentStepIndex }: ProgressBarProps) {
  return (
    <div className="mb-4 w-[calc(100%+40%)]">
      <div className="h-[2px] bg-gray-300">
        <div
          className="h-[2px] bg-primary"
          style={{ width: `${(currentStepIndex / totalSteps) * 100}%` }}
        ></div>
      </div>
    </div>
  );
}
export { ProgressBar };

function BackButton({ back }: { back: () => void }) {
  return (
    <button onClick={back} className="absolute -left-10">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="h-10 w-8 text-gray-400 hover:text-white"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 19.5L8.25 12l7.5-7.5"
        />
      </svg>
    </button>
  );
}
export { BackButton };

type ProgressStepsProps = {
  currentStepIndex: number;
  totalSteps: number;
  heading: string;
};

function ProgressSteps({
  currentStepIndex,
  totalSteps,
  heading,
}: ProgressStepsProps) {
  return (
    <div className="">
      <p className="text-sm text-gray-400">
        Step {currentStepIndex} of {totalSteps}
      </p>
      <p className="font-semibold text-white">{heading}</p>
    </div>
  );
}
export { ProgressSteps };
