import {
  Box,
  Divider,
  Grid,
  HStack,
  Link,
  SimpleGrid,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
} from '@chakra-ui/react'
import { useState } from 'react'

import {
  formatAnalyticsDuration,
  formatAnalyticsInteger,
  formatAnalyticsPercent,
} from '../author-analytics.format'
import { BlogAnalyticsDetail } from '../author-analytics.types'
import {
  BlogDiagnosticQuestion,
  formatInsightEvidence,
  getContextualEvidenceSections,
  normalizeFunnelStages,
} from '../author-analytics.visualization'
import AnalyticsInfoTooltip from './AnalyticsInfoTooltip'

interface BlogDiagnosticWorkspaceProps {
  analytics: BlogAnalyticsDetail
}

const questions: Array<{ id: BlogDiagnosticQuestion; label: string }> = [
  { id: 'retention', label: 'Do they keep reading?' },
  { id: 'sources', label: 'Where do they come from?' },
  { id: 'actions', label: 'What do they act on?' },
]

const BlogDiagnosticWorkspace = ({ analytics }: BlogDiagnosticWorkspaceProps) => {
  const [activeQuestion, setActiveQuestion] = useState<BlogDiagnosticQuestion>('retention')

  return (
    <Tabs
      index={questions.findIndex((question) => question.id === activeQuestion)}
      onChange={(index) => setActiveQuestion(questions[index]?.id ?? 'retention')}
      variant="unstyled"
      isLazy
    >
      <Text
        color="text.muted"
        fontSize="xs"
        textTransform="uppercase"
        letterSpacing="0.08em"
        mb={2}
      >
        Question
      </Text>
      <TabList
        gap={{ base: 5, md: 8 }}
        borderBottom="1px solid"
        borderColor="border.subtle"
        overflowX="auto"
        sx={{ scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}
      >
        {questions.map((question) => (
          <Tab
            key={question.id}
            flex="0 0 auto"
            px={0}
            py={3}
            color="text.muted"
            fontWeight="medium"
            borderBottom="2px solid transparent"
            _selected={{ color: 'text.primary', borderColor: 'action.primary' }}
            _focusVisible={{ boxShadow: 'outline' }}
          >
            {question.label}
          </Tab>
        ))}
      </TabList>

      <Grid
        templateColumns={{ base: '1fr', xl: 'minmax(0, 1fr) 300px' }}
        gap={{ base: 8, xl: 10 }}
        pt={7}
      >
        <TabPanels minW={0}>
          <TabPanel p={0}>
            <RetentionDiagnostic analytics={analytics} />
          </TabPanel>
          <TabPanel p={0}>
            <SourceDiagnostic analytics={analytics} />
          </TabPanel>
          <TabPanel p={0}>
            <ActionDiagnostic analytics={analytics} />
          </TabPanel>
        </TabPanels>

        <AnalyticsEvidenceRail analytics={analytics} activeQuestion={activeQuestion} />
      </Grid>
    </Tabs>
  )
}

const RetentionDiagnostic = ({ analytics }: BlogDiagnosticWorkspaceProps) => {
  const stages = normalizeFunnelStages(analytics.progressFunnel)
  const points = stages.map((stage, index) => {
    const x = stages.length <= 1 ? 320 : 40 + (index / (stages.length - 1)) * 560
    const y = 200 - Math.max(0, Math.min(1, stage.rate)) * 160
    return { ...stage, x, y }
  })

  return (
    <DiagnosticSection
      title="Reading retention"
      tooltip="The share of opened reading sessions that reached each progress marker."
    >
      {stages.length === 0 ? (
        <EmptySignal>No reading-progress signal in this range.</EmptySignal>
      ) : (
        <>
          <Box overflow="hidden" borderBottom="1px solid" borderColor="border.subtle" pb={3}>
            <Box
              as="svg"
              viewBox="0 0 640 220"
              role="img"
              aria-label={points
                .map(
                  (point) =>
                    `${point.label}: ${point.sessions} sessions, ${formatAnalyticsPercent(point.rate)}`,
                )
                .join('; ')}
              w="full"
              minH={{ base: '210px', md: '260px' }}
            >
              {[40, 80, 120, 160, 200].map((y) => (
                <line
                  key={y}
                  x1="40"
                  x2="600"
                  y1={y}
                  y2={y}
                  stroke="var(--chakra-colors-border-subtle)"
                  strokeWidth="1"
                />
              ))}
              <polyline
                points={points.map((point) => `${point.x},${point.y}`).join(' ')}
                fill="none"
                stroke="var(--chakra-colors-action-primary)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {points.map((point) => (
                <g key={point.label}>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="8"
                    fill="var(--chakra-colors-bg-page)"
                    stroke="var(--chakra-colors-action-primary)"
                    strokeWidth="4"
                  />
                  <text
                    x={point.x}
                    y={Math.max(20, point.y - 18)}
                    textAnchor="middle"
                    fill="var(--chakra-colors-text-primary)"
                    fontSize="15"
                    fontWeight="600"
                  >
                    {formatAnalyticsPercent(point.rate)}
                  </text>
                </g>
              ))}
            </Box>
          </Box>
          <SimpleGrid
            columns={{ base: 2, md: Math.min(5, Math.max(1, stages.length)) }}
            spacing={4}
            pt={4}
          >
            {stages.map((stage) => (
              <Box key={stage.label}>
                <Text color="text.muted" fontSize="xs">
                  {stage.label}
                </Text>
                <Text color="text.primary" fontWeight="medium" mt={1}>
                  {formatAnalyticsInteger(stage.sessions)}
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        </>
      )}
    </DiagnosticSection>
  )
}

const SourceDiagnostic = ({ analytics }: BlogDiagnosticWorkspaceProps) => {
  const sources = [...analytics.trafficSources].sort((left, right) => right.views - left.views)
  const maxViews = Math.max(1, ...sources.map((source) => source.views))

  return (
    <DiagnosticSection
      title="Source quality"
      tooltip="Sources are compared by reach, completion, and active reading time—not traffic volume alone."
    >
      {sources.length === 0 ? (
        <EmptySignal>No source signal in this range.</EmptySignal>
      ) : (
        <VStack align="stretch" spacing={0} divider={<Divider borderColor="border.subtle" />}>
          {sources.map((source) => (
            <Box key={`${source.category}:${source.host}`} py={5}>
              <Stack direction={{ base: 'column', md: 'row' }} justify="space-between" gap={3}>
                <Box minW={0} flex="1">
                  <Text color="text.primary" fontWeight="medium">
                    {source.host || 'Direct or unknown'}
                  </Text>
                  <Text color="text.muted" fontSize="sm">
                    {source.category}
                  </Text>
                  <Box h="5px" mt={3} bg="bg.subtle" borderRadius="full" overflow="hidden">
                    <Box
                      h="full"
                      w={`${Math.max(3, (source.views / maxViews) * 100)}%`}
                      bg="action.primary"
                      borderRadius="full"
                    />
                  </Box>
                </Box>
                <HStack spacing={{ base: 6, md: 8 }} align="start">
                  <SignalValue label="Views" value={formatAnalyticsInteger(source.views)} />
                  <SignalValue
                    label="Completion"
                    value={formatAnalyticsPercent(source.completionRate)}
                  />
                  <SignalValue
                    label="Active"
                    value={formatAnalyticsDuration(source.avgActiveReadSeconds)}
                  />
                </HStack>
              </Stack>
            </Box>
          ))}
        </VStack>
      )}
    </DiagnosticSection>
  )
}

const ActionDiagnostic = ({ analytics }: BlogDiagnosticWorkspaceProps) => {
  const reactionsAdded = analytics.reactionTrend.reduce(
    (total, point) => total + point.heartsAdded,
    0,
  )
  const reactionsRemoved = analytics.reactionTrend.reduce(
    (total, point) => total + point.heartsRemoved,
    0,
  )

  return (
    <DiagnosticSection
      title="Reader actions"
      tooltip="Recorded link clicks, hearts, and shares. These totals describe events, not unique people."
    >
      <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={5} py={3}>
        <SignalValue
          label="Link clicks"
          value={formatAnalyticsInteger(analytics.summary.linkClicks)}
        />
        <SignalValue
          label="Hearts received"
          value={formatAnalyticsInteger(analytics.summary.heartsReceived)}
        />
        <SignalValue label="Shares" value={formatAnalyticsInteger(analytics.summary.shares)} />
      </SimpleGrid>

      <Divider borderColor="border.subtle" my={5} />

      <Text
        color="text.muted"
        fontSize="xs"
        textTransform="uppercase"
        letterSpacing="0.08em"
        mb={3}
      >
        Clicked links
      </Text>
      {analytics.topLinks.length === 0 ? (
        <EmptySignal>No link clicks in this range.</EmptySignal>
      ) : (
        <VStack align="stretch" spacing={0} divider={<Divider borderColor="border.subtle" />}>
          {analytics.topLinks.map((link) => (
            <HStack key={link.linkKey} justify="space-between" align="start" py={4} gap={4}>
              <Box minW={0}>
                <Link
                  href={link.url}
                  isExternal
                  color="text.primary"
                  fontWeight="medium"
                  noOfLines={1}
                  _hover={{ color: 'action.hover', textDecoration: 'underline' }}
                >
                  {link.label || link.url}
                </Link>
                <Text color="text.muted" fontSize="xs" noOfLines={1}>
                  {link.kind}
                </Text>
              </Box>
              <Text color="text.secondary" fontSize="sm" whiteSpace="nowrap">
                {formatAnalyticsInteger(link.clicks)} · {formatAnalyticsPercent(link.ctr)} CTR
              </Text>
            </HStack>
          ))}
        </VStack>
      )}

      <Text color="text.muted" fontSize="sm" mt={5}>
        {formatAnalyticsInteger(reactionsAdded)} hearts added ·{' '}
        {formatAnalyticsInteger(reactionsRemoved)} removed
      </Text>
    </DiagnosticSection>
  )
}

const AnalyticsEvidenceRail = ({
  analytics,
  activeQuestion,
}: BlogDiagnosticWorkspaceProps & { activeQuestion: BlogDiagnosticQuestion }) => {
  const sections = getContextualEvidenceSections(activeQuestion)
  const topSource = [...analytics.trafficSources].sort((left, right) => right.views - left.views)[0]
  const topLink = [...analytics.topLinks].sort((left, right) => right.clicks - left.clicks)[0]
  const heartsAdded = analytics.reactionTrend.reduce((total, point) => total + point.heartsAdded, 0)
  const heartsRemoved = analytics.reactionTrend.reduce(
    (total, point) => total + point.heartsRemoved,
    0,
  )
  const insight = analytics.insights[0]
  const insightEvidence = insight ? formatInsightEvidence(insight) : null

  return (
    <Box
      as="aside"
      aria-label="Contextual evidence"
      borderLeft={{ xl: '1px solid' }}
      borderColor="border.subtle"
      pl={{ xl: 7 }}
    >
      <HStack spacing={2} mb={2}>
        <Text color="text.primary" fontWeight="semibold">
          Context
        </Text>
        <AnalyticsInfoTooltip
          ariaLabel="About contextual evidence"
          label="Supporting signals only. Evidence already shown in the active diagnostic is intentionally omitted here."
        />
      </HStack>
      <VStack align="stretch" spacing={0} divider={<Divider borderColor="border.subtle" />}>
        {sections.includes('sources') ? (
          <EvidenceItem
            label="Source signal"
            value={topSource?.host || topSource?.category || 'No source signal'}
            detail={
              topSource
                ? `${formatAnalyticsPercent(topSource.completionRate)} completion`
                : undefined
            }
          />
        ) : null}
        {sections.includes('links') ? (
          <EvidenceItem
            label="Top clicked link"
            value={topLink?.label || topLink?.url || 'No link clicks'}
            detail={topLink ? `${formatAnalyticsInteger(topLink.clicks)} clicks` : undefined}
          />
        ) : null}
        {sections.includes('reactions') ? (
          <EvidenceItem
            label="Reactions"
            value={`${formatAnalyticsInteger(heartsAdded)} added`}
            detail={`${formatAnalyticsInteger(heartsRemoved)} removed`}
          />
        ) : null}
        {sections.includes('insight') ? (
          <Box py={5}>
            <HStack spacing={1} mb={2}>
              <Text
                color="text.muted"
                fontSize="xs"
                textTransform="uppercase"
                letterSpacing="0.08em"
              >
                Insight
              </Text>
              {insightEvidence ? (
                <AnalyticsInfoTooltip
                  ariaLabel="Insight evidence"
                  label={[insightEvidence.sampleLabel, ...insightEvidence.evidenceLabels].join(
                    ' · ',
                  )}
                />
              ) : null}
            </HStack>
            <Text color="text.primary" fontSize="sm" lineHeight="tall">
              {insight?.message || 'No strong signal yet.'}
            </Text>
          </Box>
        ) : null}
      </VStack>
    </Box>
  )
}

const DiagnosticSection = ({
  title,
  tooltip,
  children,
}: {
  title: string
  tooltip: string
  children: React.ReactNode
}) => (
  <Box as="section" aria-label={title}>
    <HStack spacing={2} mb={5}>
      <Text color="text.primary" fontSize="lg" fontWeight="semibold">
        {title}
      </Text>
      <AnalyticsInfoTooltip ariaLabel={`About ${title}`} label={tooltip} />
    </HStack>
    {children}
  </Box>
)

const SignalValue = ({ label, value }: { label: string; value: string }) => (
  <Box>
    <Text color="text.muted" fontSize="xs">
      {label}
    </Text>
    <Text color="text.primary" fontWeight="semibold" mt={1}>
      {value}
    </Text>
  </Box>
)

const EvidenceItem = ({
  label,
  value,
  detail,
}: {
  label: string
  value: string
  detail?: string
}) => (
  <Box py={5}>
    <Text color="text.muted" fontSize="xs" textTransform="uppercase" letterSpacing="0.08em">
      {label}
    </Text>
    <Text color="text.primary" fontSize="sm" fontWeight="medium" mt={2} noOfLines={2}>
      {value}
    </Text>
    {detail ? (
      <Text color="text.muted" fontSize="xs" mt={1}>
        {detail}
      </Text>
    ) : null}
  </Box>
)

const EmptySignal = ({ children }: { children: React.ReactNode }) => (
  <Text color="text.muted" fontSize="sm" py={5}>
    {children}
  </Text>
)

export default BlogDiagnosticWorkspace
