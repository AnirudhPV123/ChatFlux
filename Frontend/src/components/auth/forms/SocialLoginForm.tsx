import { socialLoginFormFields } from "@/constants/socialLoginFormFields";

function SocialLoginForm() {
  return (
    <div className="flex flex-col items-center space-y-4">
      {socialLoginFormFields.map(({ key, value, image, callbackLink }) => (
        <button
          key={key}
          onClick={() => window.open(callbackLink, "_self")}
          className="btn btn-outline relative w-full rounded-full border-gray-500 font-bold text-white"
        >
          <img src={image} alt={value} className="absolute left-5 h-6 w-6" />
          <span>{value}</span>
        </button>
      ))}
    </div>
  );
}

export default SocialLoginForm;
