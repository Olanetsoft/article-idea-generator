import Image from "next/image";

interface AvatarProps {
  url: string;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ url, className }) => {
  return (
    <Image
      loading="lazy"
      className={`h-11 rounded-full cursor-pointer
	   transition duration-150 transform hover:scale-110 ${className}`}
      src={url}
      alt="profile pic"
      width={40}
      height={40}
    />
  );
};

export default Avatar;
