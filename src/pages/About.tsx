import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Image,
  VStack,
  HStack,
  Icon,
  Divider,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaGithub, FaTwitter, FaLinkedin } from 'react-icons/fa';

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  image: string;
  social: {
    github?: string;
    twitter?: string;
    linkedin?: string;
  };
}

const teamMembers: TeamMember[] = [
  {
    name: 'Connor Tran',
    role: 'Founder & Lead Developer',
    bio: 'Passionate about web development and creating meaningful content.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=60',
    social: {
      github: 'https://github.com/connortran216',
      // twitter: 'https://twitter.com',
      linkedin: 'https://www.linkedin.com/in/c%E1%BA%A3nh-tr%E1%BA%A7n-tu%E1%BA%A5n-b57564162/',
    },
  },
  // {
  //   name: 'You are next <3',
  //   role: 'Frontend Engineer',
  //   bio: 'Passionate about web development',
  //   image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=60',
  //   social: {},
  // },
];

const About = () => {
  const missionText = useColorModeValue('gray.600', 'text.secondary');
  const valueHeading = useColorModeValue('black', 'text.primary');
  const cardBg = useColorModeValue('white', 'bg.secondary');
  const roleText = useColorModeValue('black', 'accent.primary');
  const bioText = useColorModeValue('gray.600', 'text.secondary');
  const iconHoverColor = useColorModeValue('gray.800', 'accent.hover');

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={12}>
        {/* Mission Section */}
        <Box textAlign="center">
          <Heading mb={4}>Our Mission</Heading>
          <Text fontSize="lg" color={missionText} maxW="2xl" mx="auto">
            We are dedicated to providing high-quality content about web development,
            programming, and technology. Our goal is to help developers stay
            up-to-date with the latest trends and best practices while building a
            supportive community.
          </Text>
        </Box>

        <Divider />

        {/* Values Section */}
        <Box width="100%">
          <Heading textAlign="center" mb={8}>Our Values</Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
            <VStack>
              <Heading size="md" color={valueHeading}>Quality</Heading>
              <Text textAlign="center">
                We strive to deliver the highest quality content and maintain
                rigorous standards in our writing.
              </Text>
            </VStack>
            <VStack>
              <Heading size="md" color={valueHeading}>Community</Heading>
              <Text textAlign="center">
                We believe in fostering a supportive and inclusive community
                for developers of all skill levels.
              </Text>
            </VStack>
            <VStack>
              <Heading size="md" color={valueHeading}>Innovation</Heading>
              <Text textAlign="center">
                We stay at the forefront of technology and share cutting-edge
                insights with our readers.
              </Text>
            </VStack>
          </SimpleGrid>
        </Box>

        <Divider />

        {/* Team Section */}
        <Box width="100%">
          <Heading textAlign="center" mb={8}>Our Team</Heading>
          <SimpleGrid columns={{ base: 1, md: 1 }} justifyItems="center" spacing={10}>
            {teamMembers.map((member, index) => (
              <VStack
                key={index}
                p={6}
                bg={cardBg}
                rounded="lg"
                shadow="md"
                spacing={4}
                align="center"
              >
                <Image
                  src={member.image}
                  alt={member.name}
                  borderRadius="full"
                  boxSize="150px"
                  objectFit="cover"
                />
                <Heading size="md">{member.name}</Heading>
                <Text color={roleText} fontWeight="bold">
                  {member.role}
                </Text>
                <Text textAlign="center" color={bioText}>
                  {member.bio}
                </Text>
                <HStack spacing={4}>
                  {member.social.github && (
                    <Icon
                      as={FaGithub}
                      w={6}
                      h={6}
                      cursor="pointer"
                      _hover={{ color: iconHoverColor }}
                      onClick={() => window.open(member.social.github, '_blank')}
                    />
                  )}
                  {member.social.twitter && (
                    <Icon
                      as={FaTwitter}
                      w={6}
                      h={6}
                      cursor="pointer"
                      _hover={{ color: iconHoverColor }}
                      onClick={() => window.open(member.social.twitter, '_blank')}
                    />
                  )}
                  {member.social.linkedin && (
                    <Icon
                      as={FaLinkedin}
                      w={6}
                      h={6}
                      cursor="pointer"
                      _hover={{ color: iconHoverColor }}
                      onClick={() => window.open(member.social.linkedin, '_blank')}
                    />
                  )}
                </HStack>
              </VStack>
            ))}
          </SimpleGrid>
        </Box>
      </VStack>
    </Container>
  );
};

export default About; 