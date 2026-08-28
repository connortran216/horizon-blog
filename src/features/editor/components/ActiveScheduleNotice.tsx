import { Alert, AlertDescription, AlertIcon, Button, HStack, Text } from '@chakra-ui/react'

interface ActiveScheduleNoticeProps {
  scheduledAt: string
  onManage: () => void
}

const ActiveScheduleNotice = ({ scheduledAt, onManage }: ActiveScheduleNoticeProps) => {
  const schedule = new Date(scheduledAt)
  if (!Number.isFinite(schedule.getTime())) return null

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

  return (
    <Alert status="info" borderRadius="xl" alignItems="flex-start">
      <AlertIcon mt={1} />
      <HStack flex={1} justify="space-between" align="flex-start" spacing={4} flexWrap="wrap">
        <AlertDescription>
          <Text fontWeight="semibold">This blog is scheduled.</Text>
          <Text mt={1}>
            It will go live {schedule.toLocaleString()} ({timezone}). Content changes do not remove
            the schedule.
          </Text>
        </AlertDescription>
        <Button size="sm" variant="outline" onClick={onManage}>
          Manage schedule
        </Button>
      </HStack>
    </Alert>
  )
}

export default ActiveScheduleNotice
