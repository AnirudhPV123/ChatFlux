import { ProgressBar, ProgressSteps, BackButton } from "./";

type AuthProgressProps = {
  totalSteps: number;
  currentStepIndex: number;
  isLastStep: boolean;
  isFirstStep: boolean;
  back: () => void;
  flowType: "signup" | "forgotPassword";
};

function AuthProgress({
  totalSteps,
  currentStepIndex,
  isLastStep,
  isFirstStep,
  back,
  flowType,
}: AuthProgressProps) {
  if (isFirstStep) return;

  const steps =
    flowType === "signup"
      ? [
          { step: 2, heading: "Create a password" },
          { step: 3, heading: "Tell us about yourself" },
          { step: 4, heading: "Verify OTP" },
        ]
      : [
          { step: 2, heading: "Verify OTP" },
          { step: 3, heading: "Create new password" },
          { step: 4, heading: "Confirm password" },
        ];

  const step = steps.find((s) => s.step === currentStepIndex);

  return (
    <div className="mb-6 flex flex-col items-center">
      {/* progress bar */}
      <ProgressBar
        currentStepIndex={currentStepIndex}
        totalSteps={totalSteps}
      />

      <div className="relative flex w-full">
        {/* back button */}
        {/* if its signup show back button except for last step */}
        {/* if its forgot password show back button except for step 2 and 3 */}
        {((flowType === "signup" && !isLastStep) ||
          (flowType === "forgotPassword" &&
            ![2, 3].includes(currentStepIndex))) && <BackButton back={back} />}

        {/* progress steps */}
        <ProgressSteps
          totalSteps={totalSteps}
          currentStepIndex={currentStepIndex}
          heading={step?.heading || ""}
        />
      </div>
    </div>
  );
}

export default AuthProgress;
