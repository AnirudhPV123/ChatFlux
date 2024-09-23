type AvatarProps = {
  isGroup: boolean;
  groupName?: string;
  avatar?: string;
  size: string;
  isOnline?: boolean;
};

function Avatar({
  isGroup,
  groupName,
  avatar,
  size,
  isOnline = false,
}: AvatarProps) {
  return (
    <div
      className={`flex cursor-pointer items-center justify-center rounded-full bg-primary ${size}`}
    >
      {isGroup ? (
        <div className="flex h-full w-full items-center justify-center rounded-full bg-primary">
          <h2 className="text-3xl font-semibold text-black">
            {groupName?.charAt(0).toUpperCase()}
          </h2>
        </div>
      ) : (
        <div
          className={`avatar flex h-full w-full items-center justify-center rounded-full bg-primary ${
            isOnline ? "online" : ""
          }`}
        >
          <div className="rounded-full">
            <img src={avatar} alt="User Avatar" />
          </div>
        </div>
      )}
    </div>
  );
}

export default Avatar;
