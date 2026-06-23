export const USERNAME_REGEX = /^[a-zA-Z0-9._-]{3,30}$/;
export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
export const NAME_REGEX = /^[\p{L}\p{M}]+(?:[ '\-\.][\p{L}\p{M}]+)*$/u;

export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 30;
export const PASSWORD_MIN_LENGTH = 8;
export const NAME_MIN_LENGTH = 1;
export const NAME_MAX_LENGTH = 50;
export const BIO_MAX_LENGTH = 500;
export const REPORT_REASON_MAX_LENGTH = 500;
export const LOCATION_CITY_MAX_LENGTH = 100;
export const TAG_MIN_LENGTH = 2;
export const TAG_MAX_LENGTH = 30;
export const TAGS_MAX = 10;

export const AGE_MIN = 18;
export const AGE_MAX = 120;
export const FAME_MIN = 0;
export const FAME_MAX = 100;

export const PAGE_MIN = 1;
export const BROWSE_LIMIT_DEFAULT = 20;
export const BROWSE_LIMIT_MAX = 50;
export const CHAT_LIMIT_DEFAULT = 30;
export const CHAT_LIMIT_MAX = 50;

export const SORT_OPTIONS = ["distance", "age", "fame", "tags"];
export const ORDER_OPTIONS = ["asc", "desc"];

export const LAT_MIN = -90;
export const LAT_MAX = 90;
export const LNG_MIN = -180;
export const LNG_MAX = 180;
