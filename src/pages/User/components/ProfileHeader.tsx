import { hasFlag } from 'country-flag-icons';
import getUnicodeFlagIcon from 'country-flag-icons/unicode';

const fallbackAvatarUrl =
  'https://assets.worldcubeassociation.org/assets/326cd49/assets/missing_avatar_thumb-d77f478a307a91a9d4a083ad197012a391d5410f6dd26cb0b0e3118a5de71438.png';

interface ProfileHeaderProps {
  countryIso2?: string;
  user: User;
}

export function ProfileHeader({ countryIso2, user }: ProfileHeaderProps) {
  const avatarUrl = user.avatar?.thumb_url || user.avatar?.url || fallbackAvatarUrl;

  return (
    <div className="flex px-1 space-x-1">
      <a
        href={`https://worldcubeassociation.org/persons/${user.wca_id}`}
        target="_blank"
        rel="noreferrer">
        <img src={avatarUrl} alt={user.name} className="object-contain w-24 h-24" />
      </a>
      <div className="flex flex-col w-full">
        <div className="flex items-center flex-shrink w-full space-x-1">
          <h3 className="type-heading sm:type-title">{user.name}</h3>
        </div>
        <div className="flex space-x-1 align-center">
          {countryIso2 && hasFlag(countryIso2) && (
            <div className="flex flex-shrink type-body sm:type-heading">
              {getUnicodeFlagIcon(countryIso2)}
            </div>
          )}
          {user.wca_id && <span className="my-1 type-body-sm">{user.wca_id}</span>}
        </div>
      </div>
    </div>
  );
}
