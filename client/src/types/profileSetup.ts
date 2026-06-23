export type Gender = 'male' | 'female' | 'non-binary' | 'other';
export type SexualPreference = 'heterosexual' | 'homosexual' | 'bisexual';

export interface ProfileFormData {
  birthdate: string;
  gender: Gender | '';
  sexual_preference: SexualPreference | '';
  biography: string;
  tags: string[];
  location_city: string;
  latitude: number | null;
  longitude: number | null;
  photos: File[];
}

export interface StepConfig {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  skippable: boolean;
}

export interface StepValidation {
  valid: boolean;
  message: string;
}

export interface PhotoResponse {
  photo: {
    id: number;
    url: string;
    order_index: number;
    created_at: string;
  };
}

export interface ProfileResponse {
  user: {
    id: string;
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    gender?: Gender;
    sexual_preference?: SexualPreference;
    biography?: string;
    birth_date?: string;
    latitude?: number;
    longitude?: number;
    location_city?: string;
    tags?: string[];
    photos?: Array<{
      id: number;
      url: string;
      order_index: number;
      created_at: string;
    }>;
  };
}

export interface TagsResponse {
  tags: string[];
}
