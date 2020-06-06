import {
  EntityHeader,
  Flex,
  FlexProps,
  Image,
  MessageIcon,
  QuestionCircleIcon,
  Sans,
  Separator,
  color,
  media,
} from "@artsy/palette"
import React, { FC } from "react"
import styled from "styled-components"
import { createFragmentContainer, graphql } from "react-relay"
import { Details_conversation } from "v2/__generated__/Details_conversation.graphql"
import { DetailsFragmentContainer as ArtworkDetails } from "v2/Components/Artwork/Details"

export const DETAIL_BOX_ANIMATION = `transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);`
const DETAIL_BOX_XS_ANIMATION = `transition: opacity 0.3s, z-index 0.3s;`
const DETAIL_BOX_MD_ANIMATION = `transition: transform 0.3s;`

// in XS screens transition is animated with `opacity`. z-index: -1 is also needed when showDetail is false
// in XL screen it is animated with `width` because animation needs to push the mid column content
// in S/M/L screens it is animated with `translate` for better performance (than `width`)
const DetailsContainer = styled(Flex)<{ opacity?: 0 | 1; transform?: string }>`
  border-left: 1px solid ${color("black10")};
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  background-color: ${color("white100")};
  transform: none;
  ${DETAIL_BOX_ANIMATION}
  ${media.xl`
    transform: ${({ transform }) => transform};
    ${DETAIL_BOX_MD_ANIMATION}
    z-index: 0;
  `}
  ${media.xs`
    ${DETAIL_BOX_XS_ANIMATION}
    transform: none;
    opacity: ${({ opacity }) => opacity};
    top: 114px;
  `}
`

interface DetailsProps extends FlexProps {
  conversation: Details_conversation
  showDetails: boolean
}

export const Details: FC<DetailsProps> = ({ conversation, ...props }) => {
  const item =
    conversation.items?.[0]?.item?.__typename !== "%other" &&
    conversation.items?.[0]?.item
  return (
    <DetailsContainer
      flexDirection="column"
      justifyContent="flex-start"
      height="100%"
      flexShrink={0}
      position={["absolute", "absolute", "absolute", "absolute", "static"]}
      right={[0, 0, 0, 0, "auto"]}
      width={
        props.showDetails ? "376px" : ["376px", "376px", "376px", "376px", "0"]
      }
      opacity={props.showDetails ? 1 : 0}
      transform={props.showDetails ? "translateX(0)" : "translateX(376px)"}
      zIndex={props.showDetails ? 1 : -1}
      {...props}
    >
      <EntityHeader
        px={2}
        py={1}
        name={conversation.to.name}
        initials={conversation.to.initials}
      />
      {item && (
        <>
          <Separator />
          <Flex flexDirection="column" p={2}>
            <Sans mb={2} size="3" weight="medium">
              {item.__typename}
            </Sans>
            <Flex>
              <Image src={item.image.thumbnailUrl} />
              <Flex flexDirection="column" ml={1}>
                {item.__typename === "Artwork" && (
                  <ArtworkDetails artwork={item} showSaleLine={false} />
                )}
              </Flex>
            </Flex>
          </Flex>
        </>
      )}
      <Separator my={2} />
      <Flex flexDirection="column" px={2}>
        <Sans size="3" weight="medium" mb={2}>
          Support
        </Sans>
        <Flex alignItems="center" mb={1}>
          <QuestionCircleIcon mr={1} />
          <Sans size="3">Inquiries FAQ</Sans>
        </Flex>
        <Flex alignItems="center" mb={1}>
          <MessageIcon mr={1} />
          <Sans size="3">Contact an Artsy Specialist</Sans>
        </Flex>
      </Flex>
    </DetailsContainer>
  )
}

export const DetailsFragmentContainer = createFragmentContainer(Details, {
  conversation: graphql`
    fragment Details_conversation on Conversation
      @argumentDefinitions(
        count: { type: "Int", defaultValue: 30 }
        after: { type: "String" }
      ) {
      to {
        name
        initials
      }
      items {
        title
        permalink
        item {
          __typename
          ... on Artwork {
            ...Details_artwork
            image {
              thumbnailUrl: url(version: "small")
            }
          }
          ... on Show {
            image: coverImage {
              thumbnailUrl: url(version: "small")
            }
          }
        }
      }
    }
  `,
})
