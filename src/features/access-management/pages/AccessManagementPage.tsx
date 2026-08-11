import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Container,
  Heading,
  Select,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react'
import { LoadingScreen } from '../../../components/core/animations/LoadingState'
import { Role, ROLES } from '../../../core/authorization/authorization'
import { useAccessManagement } from '../useAccessManagement'

const AccessManagementPage = () => {
  const { users, loading, updatingUserId, error, notice, assignRole } = useAccessManagement()

  if (loading) {
    return (
      <LoadingScreen label="Loading access" description="Preparing current role assignments." />
    )
  }

  return (
    <Container maxW="container.lg" py={{ base: 10, md: 16 }}>
      <Stack spacing={8}>
        <Stack spacing={2}>
          <Text
            color="text.tertiary"
            textTransform="uppercase"
            letterSpacing="0.14em"
            fontSize="sm"
          >
            Administration
          </Text>
          <Heading color="text.primary">Access management</Heading>
          <Text color="text.secondary" maxW="2xl">
            Assign the fixed member, author, and admin roles. Permission changes apply on the next
            protected request.
          </Text>
        </Stack>

        {error ? (
          <Alert status="error" borderRadius="xl">
            <AlertIcon />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        {notice ? (
          <Alert status="success" borderRadius="xl">
            <AlertIcon />
            <AlertDescription>{notice}</AlertDescription>
          </Alert>
        ) : null}

        <Box
          overflowX="auto"
          bg="bg.secondary"
          border="1px solid"
          borderColor="border.subtle"
          borderRadius="2xl"
        >
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>User</Th>
                <Th>Email</Th>
                <Th width="180px">Role</Th>
              </Tr>
            </Thead>
            <Tbody>
              {users.map((user) => (
                <Tr key={user.id}>
                  <Td fontWeight="semibold" color="text.primary">
                    {user.name}
                  </Td>
                  <Td color="text.secondary">{user.email}</Td>
                  <Td>
                    <Select
                      aria-label={`Role for ${user.name}`}
                      value={user.role}
                      isDisabled={updatingUserId === user.id}
                      onChange={(event) => void assignRole(user.id, event.target.value as Role)}
                      bg="bg.page"
                    >
                      {ROLES.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </Select>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Stack>
    </Container>
  )
}

export default AccessManagementPage
