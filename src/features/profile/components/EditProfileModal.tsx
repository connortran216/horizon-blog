/**
 * The owner's profile fields.
 *
 * The dialog shell is still Chakra's `Modal`: the design system has no dialog
 * primitive, and Chakra's is the only thing in the repository that does focus
 * trapping, the escape key and `aria-modal` correctly. `horizonTheme` already
 * dresses it, so the overlay, the ground and the radius are tokens. Everything
 * inside it - the fields, their labels, their hints and the two buttons - is the
 * design system's, so the form no longer carries a hand-written
 * `_hover={{ bg: 'action.hover' }}` that replaced the variant's own hover
 * rather than merging with it.
 */

import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react'

import { Button, Field, Input, Select, Stack, Textarea } from '../../../design-system'
import { space } from '../../../theme/tokens'
import { ProfileFormValues } from '../profile.types'

const COUNTRY_OPTIONS = [
  'Afghanistan',
  'Albania',
  'Algeria',
  'Andorra',
  'Angola',
  'Antigua and Barbuda',
  'Argentina',
  'Armenia',
  'Australia',
  'Austria',
  'Azerbaijan',
  'Bahamas',
  'Bahrain',
  'Bangladesh',
  'Barbados',
  'Belarus',
  'Belgium',
  'Belize',
  'Benin',
  'Bhutan',
  'Bolivia',
  'Bosnia and Herzegovina',
  'Botswana',
  'Brazil',
  'Brunei',
  'Bulgaria',
  'Burkina Faso',
  'Burundi',
  'Cabo Verde',
  'Cambodia',
  'Cameroon',
  'Canada',
  'Central African Republic',
  'Chad',
  'Chile',
  'China',
  'Colombia',
  'Comoros',
  'Congo',
  'Costa Rica',
  "Cote d'Ivoire",
  'Croatia',
  'Cuba',
  'Cyprus',
  'Czech Republic',
  'Democratic Republic of the Congo',
  'Denmark',
  'Djibouti',
  'Dominica',
  'Dominican Republic',
  'Ecuador',
  'Egypt',
  'El Salvador',
  'Equatorial Guinea',
  'Eritrea',
  'Estonia',
  'Eswatini',
  'Ethiopia',
  'Fiji',
  'Finland',
  'France',
  'Gabon',
  'Gambia',
  'Georgia',
  'Germany',
  'Ghana',
  'Greece',
  'Grenada',
  'Guatemala',
  'Guinea',
  'Guinea-Bissau',
  'Guyana',
  'Haiti',
  'Honduras',
  'Hungary',
  'Iceland',
  'India',
  'Indonesia',
  'Iran',
  'Iraq',
  'Ireland',
  'Israel',
  'Italy',
  'Jamaica',
  'Japan',
  'Jordan',
  'Kazakhstan',
  'Kenya',
  'Kiribati',
  'Kuwait',
  'Kyrgyzstan',
  'Laos',
  'Latvia',
  'Lebanon',
  'Lesotho',
  'Liberia',
  'Libya',
  'Liechtenstein',
  'Lithuania',
  'Luxembourg',
  'Madagascar',
  'Malawi',
  'Malaysia',
  'Maldives',
  'Mali',
  'Malta',
  'Marshall Islands',
  'Mauritania',
  'Mauritius',
  'Mexico',
  'Micronesia',
  'Moldova',
  'Monaco',
  'Mongolia',
  'Montenegro',
  'Morocco',
  'Mozambique',
  'Myanmar',
  'Namibia',
  'Nauru',
  'Nepal',
  'Netherlands',
  'New Zealand',
  'Nicaragua',
  'Niger',
  'Nigeria',
  'North Korea',
  'North Macedonia',
  'Norway',
  'Oman',
  'Pakistan',
  'Palau',
  'Palestine',
  'Panama',
  'Papua New Guinea',
  'Paraguay',
  'Peru',
  'Philippines',
  'Poland',
  'Portugal',
  'Qatar',
  'Romania',
  'Russia',
  'Rwanda',
  'Saint Kitts and Nevis',
  'Saint Lucia',
  'Saint Vincent and the Grenadines',
  'Samoa',
  'San Marino',
  'Sao Tome and Principe',
  'Saudi Arabia',
  'Senegal',
  'Serbia',
  'Seychelles',
  'Sierra Leone',
  'Singapore',
  'Slovakia',
  'Slovenia',
  'Solomon Islands',
  'Somalia',
  'South Africa',
  'South Korea',
  'South Sudan',
  'Spain',
  'Sri Lanka',
  'Sudan',
  'Suriname',
  'Sweden',
  'Switzerland',
  'Syria',
  'Tajikistan',
  'Tanzania',
  'Thailand',
  'Timor-Leste',
  'Togo',
  'Tonga',
  'Trinidad and Tobago',
  'Tunisia',
  'Turkey',
  'Turkmenistan',
  'Tuvalu',
  'Uganda',
  'Ukraine',
  'United Arab Emirates',
  'United Kingdom',
  'United States',
  'Uruguay',
  'Uzbekistan',
  'Vanuatu',
  'Vatican City',
  'Venezuela',
  'Vietnam',
  'Yemen',
  'Zambia',
  'Zimbabwe',
].sort((a, b) => a.localeCompare(b))

interface EditProfileModalProps {
  isOpen: boolean
  isSavingProfile: boolean
  profileForm: ProfileFormValues
  onClose: () => void
  onProfileFormChange: (field: keyof ProfileFormValues, value: string) => void
  onSaveProfile: () => void
}

const EditProfileModal = ({
  isOpen,
  isSavingProfile,
  profileForm,
  onClose,
  onProfileFormChange,
  onSaveProfile,
}: EditProfileModalProps) => {
  const locationOptions = profileForm.location
    ? Array.from(new Set([...COUNTRY_OPTIONS, profileForm.location])).sort((a, b) =>
        a.localeCompare(b),
      )
    : COUNTRY_OPTIONS

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit profile</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack gap={4}>
            <Field label="Name" isRequired>
              <Input
                value={profileForm.name}
                onChange={(event) => onProfileFormChange('name', event.target.value)}
                placeholder="Your name"
                autoComplete="name"
              />
            </Field>

            <Field label="Bio" hint="A sentence or two readers see under your name.">
              <Textarea
                value={profileForm.bio}
                onChange={(event) => onProfileFormChange('bio', event.target.value)}
                placeholder="Tell readers about you"
                rows={4}
              />
            </Field>

            <Field label="Website">
              <Input
                value={profileForm.website}
                onChange={(event) => onProfileFormChange('website', event.target.value)}
                placeholder="https://example.com"
                type="url"
                autoComplete="url"
              />
            </Field>

            <Field label="Country">
              <Select
                placeholder="Select country"
                value={profileForm.location}
                onChange={(event) => onProfileFormChange('location', event.target.value)}
              >
                {locationOptions.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </Select>
            </Field>
          </Stack>
        </ModalBody>

        <ModalFooter gap={space[3]}>
          <Button tone="quiet" onClick={onClose}>
            Cancel
          </Button>
          <Button
            tone="primary"
            onClick={onSaveProfile}
            isLoading={isSavingProfile}
            loadingLabel="Saving your profile"
          >
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default EditProfileModal
