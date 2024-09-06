import { socialLoginFormFields } from "@/constants/socialLoginFormFields";


function SocialLoginForm() {
  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="divider">or</div>

      {socialLoginFormFields.map((socialLogin) => (
        <button
          key={socialLogin.key}
          className="btn btn-outline relative w-full rounded-full border-gray-500 font-bold text-white"
        >
          <img
            src={socialLogin.image}
            alt={socialLogin.value}
            className="absolute left-5 h-6 w-6"
          />
          <span>{socialLogin.value}</span>
        </button>
      ))}
    </div>
  );
}

export default SocialLoginForm;
