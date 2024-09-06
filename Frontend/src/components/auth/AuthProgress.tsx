type AuthProgressProps = {
  totalSteps: number;
  currentStepIndex: number;
  isLastStep: boolean;
  isFirstStep: boolean;
  back: () => void;
};

function AuthProgress({
  totalSteps,
  currentStepIndex,
  isLastStep,
  isFirstStep,
  back,
}: AuthProgressProps) {
  if (isFirstStep) return;

  const steps = [
    { step: 2, heading: "Create a password" },
    { step: 3, heading: "Tell us about yourself" },
    { step: 4, heading: "Verify OTP" },
  ];
  const heading = steps.find((s) => s.step === currentStepIndex);

  return (
    <div className="mb-6 flex flex-col items-center">
      {/* progress bar */}
      <div className="mb-4 w-[calc(100%+40%)]">
        <div className="h-[2px] bg-gray-300">
          <div
            className="h-[2px] bg-primary"
            style={{ width: `${(currentStepIndex / totalSteps) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* back button */}
        <div className="relative flex w-full">
      {!isLastStep && (
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
          )}

          {/* progress steps */}
          <div className="">
            <p className="text-sm text-gray-400">
              Step {currentStepIndex} of {totalSteps}
            </p>
            <p className="font-semibold text-white">{heading?.heading}</p>
          </div>
        </div>
    </div>
  );
}

export default AuthProgress;
