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
    name: 'John Doe',
    role: 'Founder & Lead Developer',
    bio: 'Passionate about web development and creating meaningful content.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=60',
    social: {
      github: 'https://github.com',
      twitter: 'https://twitter.com',
      linkedin: 'https://linkedin.com',
    },
  },
  {
    name: 'Jane Smith',
    role: 'Content Strategist',
    bio: 'Expert in creating engaging content and building online communities.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=60',
    social: {
      twitter: 'https://twitter.com',
      linkedin: 'https://linkedin.com',
    },
  },
  {
    name: 'Mike Johnson',
    role: 'Technical Writer',
    bio: 'Specializes in making complex technical concepts easy to understand.',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=60',
    social: {
      github: 'https://github.com',
      linkedin: 'https://linkedin.com',
    },
  },
];

const About = () => {
  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={12}>
        {/* Mission Section */}
        <Box textAlign="center">
          <Heading mb={4}>Our Mission</Heading>
          <Text fontSize="lg" color="gray.600" maxW="2xl" mx="auto">
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
              <Heading size="md" color="black">Quality</Heading>
              <Text textAlign="center">
                We strive to deliver the highest quality content and maintain
                rigorous standards in our writing.
              </Text>
            </VStack>
            <VStack>
              <Heading size="md" color="black">Community</Heading>
              <Text textAlign="center">
                We believe in fostering a supportive and inclusive community
                for developers of all skill levels.
              </Text>
            </VStack>
            <VStack>
              <Heading size="md" color="black">Innovation</Heading>
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
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
            {teamMembers.map((member, index) => (
              <VStack
                key={index}
                p={6}
                bg="white"
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
                <Text color="black" fontWeight="bold">
                  {member.role}
                </Text>
                <Text textAlign="center" color="gray.600">
                  {member.bio}
                </Text>
                <HStack spacing={4}>
                  {member.social.github && (
                    <Icon
                      as={FaGithub}
                      w={6}
                      h={6}
                      cursor="pointer"
                      _hover={{ color: 'gray.800' }}
                      onClick={() => window.open(member.social.github, '_blank')}
                    />
                  )}
                  {member.social.twitter && (
                    <Icon
                      as={FaTwitter}
                      w={6}
                      h={6}
                      cursor="pointer"
                      _hover={{ color: 'gray.800' }}
                      onClick={() => window.open(member.social.twitter, '_blank')}
                    />
                  )}
                  {member.social.linkedin && (
                    <Icon
                      as={FaLinkedin}
                      w={6}
                      h={6}
                      cursor="pointer"
                      _hover={{ color: 'gray.800' }}
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