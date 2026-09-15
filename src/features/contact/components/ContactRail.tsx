import { useReducer, type ReactElement } from 'react'
import { Box, Flex } from '@chakra-ui/react'
import {
  FiAlertCircle,
  FiArrowRight,
  FiCheck,
  FiCopy,
  FiMail,
  FiMapPin,
  FiPhone,
} from 'react-icons/fi'

import {
  ActionLink,
  copyAnnouncement,
  copyIsBusy,
  copyLiveRegion,
  copyReducer,
  Divider,
  Eyebrow,
  IconButton,
  idleCopyState,
  SectionLabel,
  Stack,
  Text,
} from '../../../design-system'
import { componentTokens, space } from '../../../theme/tokens'
import {
  CONTACT_EMAIL,
  CONTACT_LOCATION,
  CONTACT_PHONE,
  CONTACT_PHONE_HREF,
  copyContactEmail,
  type ClipboardWriter,
  writeToBrowserClipboard,
} from '../contact.logic'

interface ContactIconProps {
  icon: ReactElement
}

const ContactIcon = ({ icon }: ContactIconProps) => (
  <Box
    aria-hidden="true"
    display="grid"
    placeItems="center"
    width={space[16]}
    height={space[16]}
    flex="0 0 auto"
    borderRadius="full"
    bg="bg.subtle"
    color="text.primary"
    fontSize="2xl"
  >
    {icon}
  </Box>
)

interface ContactDetailRowProps {
  icon: ReactElement
  label: string
  children: ReactElement
}

const ContactDetailRow = ({ icon, label, children }: ContactDetailRowProps) => (
  <Flex gap={space[8]} alignItems="center">
    <ContactIcon icon={icon} />
    <Stack gap={2} minW={0} flex="1">
      <Eyebrow as="p">{label}</Eyebrow>
      {children}
    </Stack>
  </Flex>
)

interface ContactRailProps {
  writeToClipboard?: ClipboardWriter
}

export const ContactRail = ({ writeToClipboard = writeToBrowserClipboard }: ContactRailProps) => {
  const [copy, dispatch] = useReducer(copyReducer, idleCopyState)
  const announcement = copyAnnouncement(copy.status, 'email address')
  const live = copyLiveRegion(copy.status)

  const copyIcon =
    copy.status === 'copied' ? (
      <FiCheck />
    ) : copy.status === 'failed' ? (
      <FiAlertCircle />
    ) : (
      <FiCopy />
    )

  const copyLabel =
    copy.status === 'copying'
      ? 'Copying email address'
      : copy.status === 'copied'
        ? 'Email copied'
        : copy.status === 'failed'
          ? 'Copy email failed'
          : 'Copy email address'

  const handleCopy = () => {
    if (copyIsBusy(copy.status)) {
      return
    }

    dispatch({ type: 'copy' })
    void copyContactEmail(writeToClipboard).then(dispatch)
  }

  return (
    <Stack gap={8} minW={0}>
      <SectionLabel id="contact-rail-title">Get in touch</SectionLabel>

      <Stack gap={6}>
        <ContactDetailRow icon={<FiMail />} label="Email (best way)">
          <Text
            as="p"
            recipe="prose"
            fontWeight="semibold"
            color="text.primary"
            overflowWrap="normal"
            wordBreak="normal"
            userSelect="text"
          >
            {'canhtran210699@'}
            <wbr />
            {'gmail.com'}
          </Text>
        </ContactDetailRow>

        <Flex gap={space[3]} alignItems="stretch">
          <ActionLink
            href={`mailto:${CONTACT_EMAIL}`}
            aria-label={`Write an email to ${CONTACT_EMAIL}`}
            weight="primary"
            minH={space[12]}
            flex="1"
            justifyContent="center"
            iconEnd={<FiArrowRight aria-hidden="true" />}
          >
            Write an email
          </ActionLink>
          <IconButton
            label={copyLabel}
            icon={copyIcon}
            tone="secondary"
            size="lg"
            isLoading={copy.status === 'copying'}
            onClick={handleCopy}
            onBlur={() => dispatch({ type: 'reset' })}
            borderColor={componentTokens.control.quietFg}
          />
        </Flex>

        <Text
          as="p"
          recipe="body"
          color={copy.status === 'failed' ? 'status.danger' : 'text.secondary'}
          role={live.role}
          aria-live={live['aria-live']}
          minH={space[6]}
        >
          {announcement ?? 'Thoughtful async replies; usually slower than chat.'}
        </Text>
      </Stack>

      <Divider />

      <ContactDetailRow icon={<FiPhone />} label="Phone (secondary)">
        <ActionLink
          href={CONTACT_PHONE_HREF}
          standalone
          underline="hover"
          color="text.primary"
          fontWeight="semibold"
          width="fit-content"
        >
          {CONTACT_PHONE}
        </ActionLink>
      </ContactDetailRow>

      <Divider />

      <ContactDetailRow icon={<FiMapPin />} label="Location (secondary)">
        <Text as="p" recipe="cardTitle" fontWeight="semibold" color="text.primary">
          {CONTACT_LOCATION}
        </Text>
      </ContactDetailRow>
    </Stack>
  )
}
